var navigationCommands = {
  'site contents':
    { scope: 'web', url: '/_layouts/viewlsts.aspx' },
  'root web':
    { scope: 'site', url: '/' },
  'root site':
    { scope: 'global', url: '/' },
  'settings':
    { scope: 'web', url: '/_layouts/settings.aspx' },
  'web features':
    { scope: 'web', url: '/_layouts/managefeatures.aspx' },
  'site features':
    { scope: 'site', url: '/_layouts/managefeatures.aspx?Scope=Site' },
  'home page':
    { scope: 'web', url: '/' },
  'site settings':
    { scope: 'site', url: '/_layouts/settings.aspx' },
  'web permissions':
    { scope: 'web', url: '/_layouts/user.aspx' },
  'permission levels':
    { scope: 'web', url: '/_layouts/role.aspx' },
  'web groups':
    { scope: 'web', url: '/_layouts/groups.aspx' },
  'web users':
    { scope: 'web', url: '/_layouts/user.aspx' },
  'web columns':
    { scope: 'web', url: '/_layouts/mngfield.aspx' },
  'web content types':
    { scope: 'web', url: '/_layouts/mngctype.aspx' }
};

function normalizeInput(commandInput) {
	return commandInput.trim().replace('  ', ' ').toLowerCase();
}

function getNavigationCommand(commandInput) {
	var commandName = normalizeInput(commandInput);

	return navigationCommands[commandName];
}

exports.getNavigationCommand = getNavigationCommand;