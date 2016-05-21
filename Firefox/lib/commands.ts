export class NavigationCommand {
	constructor(name: string, scope: string, url: string) {
		this._name = name;
		this._scope = scope;
		this._url = url;
	}
	
	private _scope : string;
	public get scope() : string {
		return this._scope;
	}
	
	private _name : string;
	public get name() : string {
		return this._name;
	}
	
	private _url: string;
	public get url() : string {
		return this._url;
	}
}

export class NavigationCommands {
	private static _commands : NavigationCommand[] = [
		new NavigationCommand('tab', '', 'opens in new tab'),
		new NavigationCommand('site contents', 'web', '/_layouts/viewlsts.aspx'),
		new NavigationCommand('root web', 'site', '/'),
		new NavigationCommand('root site', 'global', '/'),
		new NavigationCommand('settings', 'web', '/_layouts/settings.aspx'),
		new NavigationCommand('web features', 'web', '/_layouts/managefeatures.aspx'),
		new NavigationCommand('site features', 'site', '/_layouts/managefeatures.aspx?Scope=Site'),
		new NavigationCommand('home page', 'web', '/'),
		new NavigationCommand('site settings', 'site', '/_layouts/settings.aspx'),
		new NavigationCommand('web permissions', 'web', '/_layouts/user.aspx'),
		new NavigationCommand('permission levels', 'web', '/_layouts/role.aspx'),
		new NavigationCommand('web groups', 'web', '/_layouts/groups.aspx'),
		new NavigationCommand('web users', 'web', '/_layouts/user.aspx'),
		new NavigationCommand('web columns', 'web', '/_layouts/mngfield.aspx'),
		new NavigationCommand('web content types', 'web', '/_layouts/mngctype.aspx'),
	];
	
	private static normalizeInput(input : string) : string {
		return input.trim().replace('  ', ' ').toLowerCase();
	}
	
	public static getCommand(input : string) : NavigationCommand {
		let commandName = this.normalizeInput(input);
		
		for (let command of NavigationCommands._commands) {
			if (command.name == commandName) {
				return command;
			}
		}
		
		return null;
	}
	
	public static getSuggestions(input : string) : NavigationCommand[] {
		let words = this.normalizeInput(input).split(' ')
		let selected : NavigationCommand[] = []
		
		for (let command of NavigationCommands._commands) {
			let add = true;
			for (let word of words) {
				if (command.name.indexOf(word) < 0) {
					add = false;
					break;
				}
			}

			if (add) {
				selected.push(command);
			}
		}
		
		return selected.sort((a, b) => a.name.localeCompare(b.name));
	}
}