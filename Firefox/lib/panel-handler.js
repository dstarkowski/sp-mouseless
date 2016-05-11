var panels = require('sdk/panel');

var panel = panels.Panel({
	contentURL: './panel-content.htm',
	contentScriptFile: './panel-content.js',
	width: 400,
	height: 280,
	position: { top: 0 },
	onShow: onShow 
});

function onShow() {
	emit('show');
}

function on(eventName, callback) {
	panel.port.on(eventName, callback);
}

function emit(eventName) {
	panel.port.emit(eventName);
}

function toggle() {
	if (panel.isShowing) {
		panel.hide()
	}
	else {
		panel.show()
	}
}

exports.on = on;
exports.emit = emit;
exports.toggle = toggle;