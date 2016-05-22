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
		if (modifier == 'tab') {
			return '';
		}

		return 'tab';
	}
}

export class NavigationCommand extends CommandBase {
	constructor(name: string, scope: string, url: string) {
		super(name);
		this._scope = scope;
		this._url = url;
	}

	private _scope : string;
	private _url: string;
	
	public canExecute(context: ITabContext): boolean {
		return context.isSharePoint;
	}
	
	public getSuggestion(context: ITabContext): CommandSuggestion {
		var url = this.getFullUrl(context);
		return new CommandSuggestion(this._name, 'Navigation', url);
	}
	
	public execute(context: ITabContext, modifier: string): string {
		var url = this.getFullUrl(context);
		
		if (modifier == 'tab') {
			Tabs.open(url);
		}
		else {
			Tabs.activeTab.url = url;
		}
		
		return '';
	}
	
	private getFullUrl(context: ITabContext): string {
		if (this._scope == 'web') {
			return context.spPageContextInfo.webAbsoluteUrl + this._url;
		}
		if (this._scope == 'site') {
			return context.spPageContextInfo.siteAbsoluteUrl + this._url;
		}
		
		return this._url;
	}
}

export class NavigationCommands {
	private static _commands : CommandBase[] = [
		new ModifierCommand('tab', 'Executes next command in new tab.'),
		new NavigationCommand('site contents', 'web', '/_layouts/viewlsts.aspx'),
		new NavigationCommand('root web', 'site', '/'),
		new NavigationCommand('root site', 'global', '/'),
		new NavigationCommand('settings', 'web', '/_layouts/settings.aspx'),
		new NavigationCommand('web features', 'web', '/_layouts/managefeatures.aspx'),
		new NavigationCommand('site features', 'site', '/_layouts/managefeatures.aspx?Scope=Site'),
		new NavigationCommand('home page', 'web', '/'),
		new NavigationCommand('site settings', 'site', '/_layouts/settings.aspx'),
		new NavigationCommand('web permissions', 'web', '/_layouts/user.aspx'),
		new NavigationCommand('permission levels', 'web', '/_layouts/role.aspx'),
		new NavigationCommand('web groups', 'web', '/_layouts/groups.aspx'),
		new NavigationCommand('web users', 'web', '/_layouts/user.aspx'),
		new NavigationCommand('web columns', 'web', '/_layouts/mngfield.aspx'),
		new NavigationCommand('web content types', 'web', '/_layouts/mngctype.aspx'),
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
		
		return selected.sort(NavigationCommands.compareCommands);
	}
	
	public static compareCommands(a: CommandSuggestion, b: CommandSuggestion): number {
		if (a.type == 'Modifier' && b.type != 'Modifier') {
			return -1;
		}
		
		if (b.type == 'Modifier' && a.type != 'Modifier') {
			return 1;
		}
		
		return a.name.localeCompare(b.name);
	}
}