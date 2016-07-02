var Tabs : FFTabs = require('sdk/tabs');

import { ITabContext } from '../interfaces'
import { CommandSuggestion } from './commandSuggestion'

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
		return new CommandSuggestion(this._name, 'Modifier', 'Modifier: ' + this._description);
	}
	
	public execute(context: ITabContext, modifier: string) {
		if (modifier == this._name) {
			return '';
		}

		return this._name;
	}
}

export class NavigationCommand extends CommandBase {
	constructor(name: string, url: string) {
		super(name)
		this._url = url;
	}
	
	protected _url: string;
	
	public canExecute(context: ITabContext) {
		if (!context.isSharePoint) {
			return false;
		}
		
		if (NavigationCommand.listRegex.test(this._url)) {
			return typeof(context.ctx) != 'undefined';
		}
		
		return true;
	}
	
	public getSuggestion(context: ITabContext): CommandSuggestion {
		var url = this.getFullUrl(context);
		return new CommandSuggestion(this._name, 'Navigation', url);
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