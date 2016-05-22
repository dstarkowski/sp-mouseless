declare function require(name: string): any;

import { ISPPageContext, ISPListContext, ITabContext, TabContextCollection } from './interfaces';
import { NavigationCommand, NavigationCommands } from './commands';
import { PanelHandler } from './panel-handler';

var Tabs = require('sdk/tabs');

class Extension {
	private _modifier: string;
	private _panel: PanelHandler;
	private _tabContext: TabContextCollection;
	
	private get currentContext(): ITabContext {
		return this._tabContext[Tabs.activeTab.id];
	}

	constructor() {
		this._modifier = '';
		this._tabContext = {};
		this._panel = new PanelHandler();
		this._panel.on('text-entered', (text: string) => this.onTextEntered(text));
		this._panel.on('text-changed', (text: string) => this.onTextChanged(text));

		Tabs.on('ready', (tab: any) => this.onTabReady(tab));
	}
	
	private onTabReady(tab: any) {
		let worker = tab.attach({
			contentScriptFile: './context.js',
			contentScriptOptions: { tabId: tab.id }
		});

		worker.port.on('context-ready', (context : ITabContext) => this.onContextReady(context));
		worker.port.emit('load-context');
	}
	
	private onContextReady(context: ITabContext) {
		this._tabContext[context.tabId] = context;
	}
	
	private onTextEntered(commandText: string) {
		let command = NavigationCommands.getCommand(commandText, this.currentContext);

		if (typeof (command) != 'undefined') {
			this._modifier = command.execute(this.currentContext, this._modifier);
			this._panel.emit('modifier-ready', this._modifier);
		}

		this._panel.toggle();
	}
	
	private onTextChanged(text: string) {
		let context = this.currentContext;
		if (typeof(context) != 'undefined') {
			var commands = NavigationCommands.getSuggestions(text, context);
			this._panel.emit('suggestions-ready', commands);
		}
	}

	private invokeScript(tab: any, scriptFile: string, options: any) : any {
		return tab.attach({
			contentScriptFile: scriptFile,
			contentScriptOptions: options
		});
	}

	private getScopeUrl(scope: string, context: ITabContext) {
		if (scope.toLowerCase() == 'web') {
			return context.spPageContextInfo.webAbsoluteUrl;
		}

		if (scope.toLowerCase() == 'site') {
			return context.spPageContextInfo.siteAbsoluteUrl;
		}
		
		return ''; 
	}
}

var extension = new Extension();