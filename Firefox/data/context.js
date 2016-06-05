function loadContext() {
	var context = {
		tabId: self.options.tabId,
		isSharePoint: typeof(unsafeWindow._spPageContextInfo) != 'undefined'
	};

	if (context.isSharePoint) {
		context.spPageContextInfo = unsafeWindow._spPageContextInfo;

		if (typeof(unsafeWindow.ctx) != 'undefined') {
			context.ctx = unsafeWindow.ctx;
		}
	}

	self.port.emit('context-ready', context);
}

self.port.on('load-context', loadContext);