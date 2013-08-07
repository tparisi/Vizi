goog.provide("Vizi.System");

Vizi.System = {
	warn : function() {
		var args = ["Vizi Warning: "].concat([].slice.call(arguments));
		console.warn.apply(console, args);
	}
};