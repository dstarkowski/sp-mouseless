declare function require(name: string): any;

var panels = require('sdk/panel');
var { Hotkey } = require('sdk/hotkeys');

export class PanelHandler {
	private _panel : any;
	private _hotkey: any;
	
	constructor() {
		this._panel = panels.Panel({
			contentURL: './panel-content.htm',
			contentScriptFile: [
				'./react.js',
				'./react-dom.js',
				'./panel-content.js',
			],
			width: 400,
			height: 280,
			position: { top: 0 },
			onShow: () => this.onShow() 
		});
		
		this._hotkey = Hotkey({
			combo: 'f1',
			onPress: () => this.toggle()
		});
	}
	
	private onShow() {
		this.emit('show');
	}
	
	public emit(eventName : string, args?: any) {
		this._panel.port.emit(eventName, args);
	}
	
	public on(eventName : string, callback : Function) {
		this._panel.port.on(eventName, callback);
	}
	
	public toggle() {
		if (this._panel.isShowing) {
			this._panel.hide()
		}
		else {
			this._panel.show()
		}
	}
}