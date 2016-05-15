declare function require(name: string): any;

import { NavigationCommand, NavigationCommands } from './commands';
import { PanelHandler } from './panel-handler';

var Tabs = require('sdk/tabs');

var modifier = '';
var panel = new PanelHandler();

function navigate(scope : string, url : string) {
  Tabs.activeTab.attach({
    contentScriptFile: './navigate.js',
    contentScriptOptions: {
      'scope': scope,
      'url': url
    }
  });
};

panel.on('text-entered', function(text : string) {
  var commandText = text.trim().replace('  ', ' ').toLowerCase();
  var navigationCommand = NavigationCommands.getCommand(commandText);

  if (typeof(navigationCommand) != 'undefined') {
    navigate(navigationCommand.scope, navigationCommand.url);
  }
  panel.toggle();
});