declare function require(name: string): any;
interface FFSimpleStorage {
	Storage : any;
}
interface FFSelf {
	data: FFSelfData;
	port: FFPort;
}
interface FFSelfData {
	load(name: string) : string;
}
interface FFTabs {
	activeTab : FFTab;
	on(eventName : string, callback : (tab : FFTab) => void) : void;
	open(options : FFTabOpenOptions) : void;
}
interface FFTabOpenOptions{
	url: string;
	inBackground: boolean;
}
interface FFTab {
	id : string;
	attach(options : FFScriptAttachOptions) : FFScriptWorker;
	url : string; 
}
interface FFScriptWorker {
	port : FFPort;
}
interface FFPort {
	on(eventName : string, callback : () => any) : void;
	on(eventName : string, callback : (params : any) => any) : void;
	emit(eventName : string) : void;
	emit(eventName : string, params : any) : void;
}
interface FFScriptAttachOptions {
	contentScriptFile : string;
	contentScriptOptions : any;
}
interface FFSimplePrefs {
	prefs: any;
	on(prefName : string, callback : (prefName : string) => void) : void;
}
interface FFPanel {
	port: FFPort;
	isShowing: boolean;
	hide() : void;
	show() : void;
}
interface FFHotkeys {
	Hotkey : FFHotkey;
}
interface FFHotkey {
	(options: FFHotkeyOptions) : FFHotkey;
	destroy() : void;
}
interface FFHotkeyOptions {
	combo: string;
	onPress() : void; 
}