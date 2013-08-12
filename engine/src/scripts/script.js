/**
 * @fileoverview Behavior component - base class for time-based behaviors
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Script');
goog.require('Vizi.Component');

Vizi.Script = function(param) {
	param = param || {};
    Vizi.Component.call(this, param);
}

goog.inherits(Vizi.Script, Vizi.Component);

Vizi.Script.prototype._componentCategory = "scripts";

Vizi.Script.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
}

Vizi.Script.prototype.update = function()
{
	if (Vizi.Script.WARN_ON_ABSTRACT)
		Vizi.System.warn("Abstract Script.evaluate called");
}

Vizi.Script.WARN_ON_ABSTRACT = true;
