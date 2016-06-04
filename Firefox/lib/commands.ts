var Tabs : FFTabs = require('sdk/tabs');
var self : FFSelf = require('sdk/self');

import { ITabContext } from './interfaces.ts'

export class CommandSuggestion {
	constructor(name: string, type: string, description: string) {
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	name: string;
	type: string;
	description: string;
}

export abstract class CommandBase {
	constructor(name: string) {
		this._name = name;
	}

	protected _name: string;

	public abstract getSuggestion(context: ITabContext): CommandSuggestion;
	public abstract canExecute(context: ITabContext): boolean;
	public abstract execute(context: ITabContext, modifier: string): string;

	public isNameMatch(input: string): boolean {
		return this._name == this.normalizeInput(input);
	}

	public isSuggestionMatch(input: string): boolean {
		let words = this.normalizeInput(input).split(' ');
		
		for (let word of words) {
			if (this._name.indexOf(word) < 0) {
				return false;
			}
		}
		
		return true;
	}
	
	protected normalizeInput(input: string): string {
		return input.trim().replace('  ', ' ').toLowerCase();
	}
}

export class ModifierCommand extends CommandBase {
	constructor(name: string, description: string) {
		super(name);
		this._description = description;
	}
	
	private _description: string;
	
	public canExecute(): boolean {
		return true;
	}
	
	public getSuggestion(context: ITabContext): CommandSuggestion {
		return new CommandSuggestion(this._name, 'Modifier', this._description);
	}
	
	public execute(context: ITabContext, modifier: string) {
		if (modifier == this._name) {
			return '';
		}

		return this._name;
	}
}

export abstract class NavigationCommandBase extends CommandBase {
	constructor(name: string, url: string) {
		super(name)
		this._url = url;
	}
	
	protected _url: string;
	
	public canExecute(context: ITabContext): boolean {
		return context.isSharePoint;
	}
	
	public getSuggestion(context: ITabContext): CommandSuggestion {
		var url = this.getFullUrl(context);
		return new CommandSuggestion(this._name, 'Navigation', url);
	}
	
	protected abstract getFullUrl(context: ITabContext): string;
	
	public execute(context: ITabContext, modifier: string): string {
		var url = this.getFullUrl(context);
		
		if (modifier == 'tab') {
			Tabs.open({ url: url, inBackground: false });
		}		
		else if (modifier == 'bgtab') {
			Tabs.open({ url: url, inBackground: true });
		}
		else {
			Tabs.activeTab.url = url;
		}
		
		return '';
	}
}

export class NavigationCommand extends NavigationCommandBase {
	public canExecute(context: ITabContext) {
		if (!context.isSharePoint) {
			return false;
		}
		
		if (NavigationCommand.listRegex.test(this._url)) {
			return typeof(context.ctx) != 'undefined';
		}
		
		return true;
	}
	
	private static listRegex = /{(listId|viewId)}/i;
	
	protected getFullUrl(context: ITabContext): string {
		let url = this._url;
		
		let webUrl = context.spPageContextInfo.webAbsoluteUrl;
		let siteUrl = context.spPageContextInfo.siteAbsoluteUrl;
		url = url.replace(/{webUrl}/gi, webUrl);
		url = url.replace(/{siteUrl}/gi, siteUrl);

		if (NavigationCommand.listRegex.test(url)) {
			let listId = context.ctx.listName;
			let viewId = context.ctx.view;
			url = url.replace(/{listId}/gi, listId);
			url = url.replace(/{viewId}/gi, viewId);
		}
		
		return url;
	}
}

export class CommandsCollection {
	constructor() {
		this._commands = []; 
		this._commands.push(new ModifierCommand('tab', 'Executes next command in new tab.'));
		this._commands.push(new ModifierCommand('bgtab', 'Executes next command in new tab opened in background.'));
	
		this.loadCommands();
	}

	private _commands : CommandBase[];
	
	private loadCommands() {
		let content = self.data.load('commands.json');
		let json = JSON.parse(content);
		
		for (let item of json) {
			this._commands.push(new NavigationCommand(item.name, item.url));
		}
	}
	
	public getCommand(input : string, context: ITabContext) : CommandBase {
		for (let command of this._commands) {
			if (command.canExecute(context) && command.isNameMatch(input)) {
				return command;
			}
		}
		
		return null;
	}
	
	public getSuggestions(input: string, context: ITabContext) : CommandSuggestion[] {
		let selected : CommandSuggestion[] = []
		
		for (let command of this._commands) {
			if (command.canExecute(context) && command.isSuggestionMatch(input)) {
				selected.push(command.getSuggestion(context));
			}
		}
		
		return selected.sort((a, b) => this.compareCommands(a, b, input));
	}
	
	public compareCommands(a: CommandSuggestion, b: CommandSuggestion, input: string): number {
		//TODO: replace all
		input = input.trim().replace('  ', ' ').toLowerCase();
		
		if (a.name == input) {
			return -1;
		}
		if (b.name == input) {
			return 1;
		}
		
		if (a.type == 'Modifier' && b.type != 'Modifier') {
			return -1;
		}
		
		if (b.type == 'Modifier' && a.type != 'Modifier') {
			return 1;
		}
		
		return a.name.localeCompare(b.name);
	}
}