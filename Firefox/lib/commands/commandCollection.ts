var Tabs : FFTabs = require('sdk/tabs');
var self : FFSelf = require('sdk/self');
var storage : FFSimpleStorage = require('sdk/simple-storage');
var preferences : FFSimplePrefs = require('sdk/simple-prefs')

import { ITabContext } from '../interfaces'
import { CommandBase, ModifierCommand, NavigationCommand } from './command'
import { CommandSuggestion } from './commandSuggestion'

export class CommandsCollection {
	constructor() {
		this._commands = []; 
		this._commands.push(new ModifierCommand('tab', 'Executes next command in new tab.'));
		this._commands.push(new ModifierCommand('bgtab', 'Executes next command in new tab opened in background.'));

		this.loadCommands();
		
		preferences.on('commands', () => this.openCommandsPage());
	}
	
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
                    contentScriptOptions: { commands: storage.storage.commands }
                });
					worker.port.on('save', (commands : string) => collection.saveCommands(commands));
            }
        });
	}
	
	private _commands : CommandBase[];
	
	private saveCommands(commands : string) {
		storage.storage.commands = commands;
		this._commands = [];
		this.loadCommands();
	}
	
	private loadCommands() {
		if (storage.storage.commands == null) {
			storage.storage.commands = self.data.load('commands.json');
		}
		
		let commands = JSON.parse(storage.storage.commands);

		for (let item of commands) {
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