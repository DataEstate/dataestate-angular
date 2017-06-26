de.factory("DeScriptLoader", function($q) {
	function loadScript(src) {
		var script=document.createElement('script');
		script.src=src;
		document.getElementsByTagName('head')[0].appendChild(script);
		return script;
	}
	return {
		load:function(scriptSrc) {
			return $q(function(resolve) {
				loadScript(scriptSrc).onload=function() {
					resolve();
				}
			});
		}
	}
});

de.directive("lazyLoad", function(DeScriptLoader) {
	return {
		scope:{
			onload:"&?"
		},
		link:function(scope,elem,attr) {
			if (scope.onload!==undefined) {
				scope.onload();
			}
		}
	}
});