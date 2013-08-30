goog.provide("Vizi.System");

Vizi.System = {
	log : function() {
		var args = ["[Vizi] "].concat([].slice.call(arguments));
		console.log.apply(console, args);
	},
	warn : function() {
		var args = ["[Vizi] "].concat([].slice.call(arguments));
		console.warn.apply(console, args);
	},
	error : function() {
		var args = ["[Vizi] "].concat([].slice.call(arguments));
		console.error.apply(console, args);
	}
};