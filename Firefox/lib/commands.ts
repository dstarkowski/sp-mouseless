declare function require(name: string): any;
var Tabs = require('sdk/tabs');

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

export class NavigationCommands {
	private static _commands : CommandBase[] = [
		new ModifierCommand('tab', 'Executes next command in new tab.'),
		new ModifierCommand('bgtab', 'Executes next command in new tab opened in background.'),
		new NavigationCommand('site contents', '{webUrl}/_layouts/viewlsts.aspx'),
		new NavigationCommand('root web', '{siteUrl}/'),
		new NavigationCommand('root site', '/'),
		new NavigationCommand('web settings', '{webUrl}/_layouts/settings.aspx'),
		new NavigationCommand('web features', '{webUrl}/_layouts/managefeatures.aspx'),
		new NavigationCommand('site features', '{siteUrl}/_layouts/managefeatures.aspx?Scope=Site'),
		new NavigationCommand('home page', '{webUrl}/'),
		new NavigationCommand('site settings', '{siteUrl}/_layouts/settings.aspx'),
		new NavigationCommand('web permissions', '{webUrl}/_layouts/user.aspx'),
		new NavigationCommand('permission levels', '{webUrl}/_layouts/role.aspx'),
		new NavigationCommand('web groups', '{webUrl}/_layouts/groups.aspx'),
		new NavigationCommand('web users', '{webUrl}/_layouts/user.aspx'),
		new NavigationCommand('web columns', '{webUrl}/_layouts/mngfield.aspx'),
		new NavigationCommand('web content types', '{webUrl}/_layouts/mngctype.aspx'),
		new NavigationCommand('list settings', '{webUrl}/_layouts/15/listedit.aspx?List={listId}'),
		new NavigationCommand('list permissions', '{webUrl}/_layouts/15/user.aspx?obj={listId},doclib'),
		new NavigationCommand('add view', '{webUrl}/_layouts/15/viewtype.aspx?List={listId}'),
		new NavigationCommand('edit view', '{webUrl}/_layouts/15/viewedit.aspx?List={listId}&View={viewId}'),
		new NavigationCommand('add item', '{webUrl}/_layouts/15/listform.aspx?PageType=8&ListId={listId}&RootFolder=')
	];
	
	public static getCommand(input : string, context: ITabContext) : CommandBase {
		for (let command of NavigationCommands._commands) {
			if (command.canExecute(context) && command.isNameMatch(input)) {
				return command;
			}
		}
		
		return null;
	}
	
	public static getSuggestions(input: string, context: ITabContext) : CommandSuggestion[] {
		let selected : CommandSuggestion[] = []
		
		for (let command of NavigationCommands._commands) {
			if (command.canExecute(context) && command.isSuggestionMatch(input)) {
				selected.push(command.getSuggestion(context));
			}
		}
		
		return selected.sort((a, b) => NavigationCommands.compareCommands(a, b, input));
	}
	
	public static compareCommands(a: CommandSuggestion, b: CommandSuggestion, input: string): number {
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