goog.provide("Vizi.System");

Vizi.System = {
	log : function() {
		var args = [].slice.call(arguments);
		console.log.apply(console, args);
	},
	warn : function() {
		var args = ["Vizi Warning: "].concat([].slice.call(arguments));
		console.warn.apply(console, args);
	}
};