export interface ISPPageContext {
	webServerRelativeUrl: string; // /site
	webAbsoluteUrl: string; // https://tenant.sharepoint.com/site
	siteAbsoluteUrl: string; // https://tenant.sharepoint.com/site
	serverRequestPath: string; // /_layouts/15/settings.aspx
	layoutsUrl: string; // _layouts/15
	isAppWeb: boolean;
	webLanguage: string; // 1033
	currentLanguage: string; // 1033
	currentUICultureName: string; // en-US
	currentCultureName: string; // en-US
	webUIVersion: string; // 15
	siteServerRelativeUrl: string;
	ProfileUrl: string; // https://tenant-my.sharepoint.com/person.aspx
}

export interface ISPListContext {
	listName: string; // {00000000-0000-0000-0000-0000000000000}
	ListTitle: string;
	listUrlDir: string; // /site/lists/listUrl
	view: string; // {00000000-0000-0000-0000-0000000000000}
}

export interface ITabContext {
	isSharePoint : boolean;
	tabId : any;
	spPageContextInfo : ISPPageContext;
	ctx : ISPListContext;
}

export interface TabContextCollection {
    [key: string]: ITabContext;
}