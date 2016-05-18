declare function require(name: string): any;

import { NavigationCommand, NavigationCommands } from './commands';
import { PanelHandler } from './panel-handler';

var Tabs = require('sdk/tabs');

class Extension {
	private _modifier: string;
	private _panel: PanelHandler;

	constructor() {
		this._modifier = '';
		this._panel = new PanelHandler();
		this._panel.on('text-entered', (text: string) => this.onTextEntered(text)); 
		this._panel.on('text-changed', (text: string) => this.onTextChanged(text));
	}
	
	private onTextEntered(commandText: string) {
		var navigationCommand = NavigationCommands.getCommand(commandText);

		if (typeof (navigationCommand) != 'undefined') {
			this.navigate(navigationCommand.scope, navigationCommand.url);
		}

		this._panel.toggle();
	}
	
	private onTextChanged(text: string) {
		var commands = NavigationCommands.getSuggestions(text);
		
		this._panel.emit('suggestions-ready', commands);
	}

	private invokeScript(scriptFile: string, options: any) {
		Tabs.activeTab.attach({
			contentScriptFile: scriptFile,
			contentScriptOptions: options
		});
	}

	private navigate(scope: string, url: string) {
		var options = { 'scope': scope, 'url': url };
		this.invokeScript('./navigate.js', options);
	}
}

var extension = new Extension();