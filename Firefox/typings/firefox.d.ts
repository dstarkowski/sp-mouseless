declare function require(name: string): any;
interface FFSimpleStorage {
	storage : any;
}
interface FFSelf {
	data: FFSelfData;
	port: FFPort;
	options: any;
}
interface FFSelfData {
	load(name: string) : string;
	url(name: string) : string;
}
interface FFTabs {
	activeTab : FFTab;
	on(eventName : string, callback : (tab : FFTab) => void) : void;
	open(options : { url: string, inBackground?: boolean, onReady?: any }) : void;
	open(url: string) : void;
}
interface FFTab {
	id : string;
	attach(options : { contentScriptFile: string, contentScriptOptions: any }) : FFScriptWorker;
	attach(options : { contentScriptFile: string[], contentScriptOptions: any }) : FFScriptWorker;
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
	(options: { combo: string, onPress() : void }) : FFHotkey;
	destroy() : void;
}