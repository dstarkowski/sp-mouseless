function navigate(scope, url) {
	if (typeof(unsafeWindow._spPageContextInfo) != 'undefined') {
		var webUrl = getScopeUrl(scope);
		window.location = webUrl + url;
	} 
}

function getScopeUrl(scope) {
	if (scope.toLowerCase() == 'web') {
		return unsafeWindow._spPageContextInfo.webAbsoluteUrl;
	}

	if (scope.toLowerCase() == 'site') {
		return unsafeWindow._spPageContextInfo.siteAbsoluteUrl;
	}
	
	return ''; 
}

navigate(self.options.scope, self.options.url);