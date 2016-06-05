var preferences : FFSimplePrefs = require('sdk/simple-prefs')
var { Panel } = require('sdk/panel');
var { Hotkey } : FFHotkeys = require('sdk/hotkeys');

export class LauncherPanel {
	private _panel : FFPanel;
	private _hotkey: FFHotkey;
	
	constructor() {
		let theme = preferences.prefs['theme'];
		let styleFile = theme == 0 ? './light.css' : './dark.css';
		
		this._panel = Panel({
			contentURL: './launcher/launcher.html',
			contentScriptFile: [
				'./libs/react.js',
				'./libs/react-dom.js',
				'./launcher/launcher.js',
			],
			contentStyleFile: styleFile,
			width: 550,
			height: 280,
			position: { top: -5 },
			onShow: () => this.onShow() 
		});
		
		this.initHotkey();
		preferences.on('hotkey', () => this.initHotkey());
	}
	
	private initHotkey() {
		if (this._hotkey != null) {
			this._hotkey.destroy();
		}

		let hotkey : string = preferences.prefs['hotkey'];
		
		if (/^(accel-|accel-alt-)(shift-)?(f\d{1,2}|\w)|f\d{1,2}$/.test(hotkey)) {
			this._hotkey = Hotkey({
				combo: hotkey,
				onPress: () => this.toggle()
			});
		}
	}
	
	private onShow() {
		this.emit('show');
	}
	
	public emit(eventName : string, args?: any) {
		this._panel.port.emit(eventName, args);
	}
	
	public on(eventName : string, callback : (options : any) => void) {
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