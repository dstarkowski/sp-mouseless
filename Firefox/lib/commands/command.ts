let Tabs : FFTabs = require('sdk/tabs');
let { uuid } = require('sdk/util/uuid');

import { ITabContext } from '../interfaces'
import { CommandSuggestion } from './commandSuggestion'

export abstract class CommandBase {
	constructor(name: string) {
		this._name = name;
		this.uuid = uuid().toString();
	}

	protected _name: string;
	public uuid: string;

	public abstract getSuggestion(context: ITabContext): CommandSuggestion;
	public abstract canExecute(context: ITabContext): boolean;
	public abstract execute(context: ITabContext, modifier: string): string;

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
		return new CommandSuggestion(this.uuid, this._name, 'Modifier', 'Modifier: ' + this._description);
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
		this.initTokens(url);
	}
	
	protected _url: string;
	protected _tokens: string[];
	
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
		return new CommandSuggestion(this.uuid, this._name, 'Navigation', url);
	}
	
	private static listRegex = /{(listId|viewId)}/i;
	
	protected getFullUrl(context: ITabContext): string {
		let url = this._url;

		for (let token of this._tokens) {
			let value = this.getTokenValue(context, token);
			let regex = new RegExp('{' + token + '}', 'gmi');

			url = url.replace(regex, value);
		}
		
		return url;
	}

	private initTokens(url: string) {
		this._tokens = [];
		
		let tokenRegex = /{(.+?)}/gmi;
		
		let match = tokenRegex.exec(url);
		while (match != null) {
			this._tokens.push(match[1]);
			match = tokenRegex.exec(url)
		}
	}
	
	private getTokenValue(context: any, token: string) : string {
		let tokenParts = token.split('.');
		let contextObject = context;
		for (let part of tokenParts) {
			contextObject = contextObject[part];
			if (typeof(contextObject) === 'undefined') {
				return '{' + token + '}';
			}
		}
		
		return contextObject.toString();
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