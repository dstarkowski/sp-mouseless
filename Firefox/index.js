var { Hotkey } = require('sdk/hotkeys');

var data = require('sdk/self').data;
var tabs = require('sdk/tabs');

var panels = require('sdk/panel');
var panel = panels.Panel({
  contentURL: data.url('search-panel.htm'),
  contentScriptFile: data.url('search-panel.js'),
  width: 400,
  height: 40,
  onHide: handleHide
});

var buttons = require('sdk/ui/button/toggle');

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
  console.log(scope);
  console.log(url);
  tabs.activeTab.attach({
    contentScriptFile: data.url('mouseless.js'),
    contentScriptOptions: {
      'scope': scope,
      'url': url
    }
  });
};
  
panel.port.on('text-entered', function(text) {
  if (text == 'site content' || text == 'site contents') {
    navigate('web', '/_layouts/viewlsts.aspx');
  }
  if (text == 'settings') {
    navigate('web', '/_layouts/settings.aspx');
  }
  if (text == 'web features') {
    navigate('web', '/_layouts/managefeatures.aspx');
  }
  if (text == 'site features') {
    navigate('site', '/_layouts/managefeatures.aspx?Scope=Site');
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