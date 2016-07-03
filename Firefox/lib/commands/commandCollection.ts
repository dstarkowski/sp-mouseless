let Tabs : FFTabs = require('sdk/tabs');
let self : FFSelf = require('sdk/self');
let storage : FFSimpleStorage = require('sdk/simple-storage');
let preferences : FFSimplePrefs = require('sdk/simple-prefs')

import { ITabContext } from '../interfaces'
import { CommandBase, ModifierCommand, NavigationCommand } from './command'
import { CommandSuggestion } from './commandSuggestion'

export class CommandStore {
	constructor() {
		this._packages = [];
		this._modifiers = [
			new ModifierCommand('tab', 'Executes next command in new tab.'),
			new ModifierCommand('bgtab', 'Executes next command in new tab opened in background.')
		];

		this.loadCommands();

		preferences.on('commands', () => this.openCommandsPage());
	}

	private _version: string;
	private _packages: CommandPackage[];
	private _modifiers: ModifierCommand[];
	
	private openCommandsPage() {
		let collection = this;
		Tabs.open({
            url: self.data.url('./configuration/commands.html'),
            onReady: function (tab : FFTab) {
                var worker = tab.attach({
                    contentScriptFile: [
                        './libs/react.js',
                        './libs/react-dom.js',
                        './configuration/commands.js'],
                    contentScriptOptions: { commands: storage.storage.commandStore }
                });
					worker.port.on('save', (commands : string) => collection.saveCommands(commands));
            }
        });
	}
	
	private saveCommands(commands : string) {
		storage.storage.commandStore = commands;
		this._packages = [];
		this.loadCommands();
	}
	
	private loadCommands() {
		if (storage.storage.commandStore == null) {
			storage.storage.commandStore = self.data.load('commands.json');
		}

		let json = JSON.parse(storage.storage.commandStore);
		this._version = json.version;

		for (let item of json.packages) {
			this._packages.push(new CommandPackage(item));
		}
	}
	
	public getSuggestions(input: string, context: ITabContext, url: string) : CommandSuggestion[] {
		let selected : CommandSuggestion[] = []

		for (let modifier of this._modifiers) {
			if (modifier.isSuggestionMatch(input)) {
				selected.push(modifier.getSuggestion(context));
			}
		}

		for (let item of this._packages) {
			selected.push(...item.getSuggestions(input, context, url));
		}
		
		return selected.sort((a, b) => this.compareCommands(a, b, input));
	}
	
	public getCommand(uuid : string) : CommandBase {
		for (let modifier of this._modifiers) {
			if (modifier.uuid === uuid) {
				return modifier;
			}
		}

		for (let item of this._packages) {
			let command = item.getCommand(uuid)
			if (command !== null) {
				return command;
			}
		}
		
		return null;
	}
	
	private compareCommands(a: CommandSuggestion, b: CommandSuggestion, input: string): number {
		input = input
			.trim()
			.replace(/\s\s+/g, ' ')
			.toLowerCase();
		
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

export class CommandPackage {
	constructor(json: any) {
		this._name = json.name;
		this._urlRegex = json.urlRegex;
		this._contextScript = json.contextScript;

		this._collections = [];
		for (let item of json.collections) {
			this._collections.push(new CommandCollection(item));
		}
	}

	private _name: string;
	private _urlRegex: string;
	private _contextScript: string;
	private _collections: CommandCollection[];
	
	public getSuggestions(input: string, context: ITabContext, url: string) : CommandSuggestion[] {
		let selected : CommandSuggestion[] = []

		if (this.canExecute(url)) {
			for (let item of this._collections) {
				selected.push(...item.getSuggestions(input, context));
			}
		}

		return selected;
	}
	
	public getCommand(uuid : string) : CommandBase {
		for (let item of this._collections) {
			let command = item.getCommand(uuid)
			if (command !== null) {
				return command;
			}
		}
		
		return null;
	}
	
	private canExecute(url: string) : boolean {
		var regex = new RegExp(this._urlRegex);
		return regex.test(url); 
	}
}

export class CommandCollection {
	constructor(json: any) {
		this._name = json.name;
		this._tokensRequired = json.tokensRequired;
		this._commands = [];

		for (let item of json.commands) {
			this._commands.push(new NavigationCommand(item.name, item.url));
		}
	}

	private _name: string;
	private _tokensRequired: string[];
	private _commands: CommandBase[];
	
	public getSuggestions(input: string, context: ITabContext) : CommandSuggestion[] {
		let selected : CommandSuggestion[] = []
		
		if (this.canExecute(context)) {
			for (let item of this._commands) {
				if (item.canExecute(context) && item.isSuggestionMatch(input)) {
					selected.push(item.getSuggestion(context));
				}
			}
		}
		
		return selected;
	}
	
	public getCommand(uuid : string) : CommandBase {
		for (let item of this._commands) {
			if (item.uuid === uuid) {
				return item;
			}
		}
		
		return null;
	}

	private canExecute(context: any) : boolean {
		for (let token of this._tokensRequired) {
			let tokenParts = token.split('.');
			let contextObject = context;
			for (let part of tokenParts) {
				contextObject = contextObject[part];
				if (typeof(contextObject) === 'undefined') {
					return false;
				}
			}
		} 
		
		return true;
	}
}