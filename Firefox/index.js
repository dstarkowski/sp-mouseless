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

var { Hotkey } = require('sdk/hotkeys');

var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');

var panel = panels.Panel({
  contentURL: './search-panel.htm',
  contentScriptFile: './search-panel.js',
  width: 400,
  height: 40,
  onHide: handleHide
});

var button = buttons.ToggleButton({
  id: 'show-panel',
  label: 'SPMouseless',
  icon : {
    '16': './icon-16.png',
    '32': './icon-32.png',
    '64': './icon-64.png'
  },
  onChange: handleChange
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

panel.on('show', function() {
  panel.port.emit('show');
});

function navigate(scope, url) {
  tabs.activeTab.attach({
    contentScriptFile: './navigate.js',
    contentScriptOptions: {
      'scope': scope,
      'url': url
    }
  });
};
  
panel.port.on('text-entered', function(text) {
  var commandText = text.trim().replace('  ', ' ').toLowerCase();
  var navigationCommand = navigationCommands[commandText];

  if (typeof(navigationCommand) != 'undefined') {
    navigate(navigationCommand.scope, navigationCommand.url);
  }
  panel.hide();
});

var showHotKey = Hotkey({
  combo: 'f1',
  onPress: function() {
    var state = {checked: true};
    button.state('window', state);
    handleChange(state);
  }
});