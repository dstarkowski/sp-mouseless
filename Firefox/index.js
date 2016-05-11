var modifier = '';

var { Hotkey } = require('sdk/hotkeys');

var tabs = require('sdk/tabs');
var commands = require('./lib/commands.js');
var panel = require('./lib/panel-handler.js');

function navigate(scope, url, modifier) {
  tabs.activeTab.attach({
    contentScriptFile: './navigate.js',
    contentScriptOptions: {
      'scope': scope,
      'url': url,
      'modifier': modifier
    }
  });
};

panel.on('text-entered', function(text) {
  var commandText = text.trim().replace('  ', ' ').toLowerCase();
  var navigationCommand = commands.getNavigationCommand(commandText);

  if (commandText == 'tab') {
    modifier = 'tab';
  }
  else {
    if (typeof(navigationCommand) != 'undefined') {
      navigate(navigationCommand.scope, navigationCommand.url, modifier);
    }
    modifier = ''
    panel.hide();
  }
});

var showHotKey = Hotkey({
  combo: 'f1',
  onPress: panel.toggle
});