/**
 * @fileoverview Base class for visual decoration - like Vizi.Visual but not pickable.
 * @author Tony Parisi
 */
goog.provide('Vizi.Decoration');
goog.require('Vizi.Visual');

/**
 * @constructor
 */
Vizi.Decoration = function(param)
{
	param = param || {};
	
	Vizi.Visual.call(this, param);

}

goog.inherits(Vizi.Decoration, Vizi.Visual);

Vizi.Decoration.prototype._componentCategory = "decorations";

Vizi.Decoration.prototype.realize = function()
{
	Vizi.Visual.prototype.realize.call(this);
	this.object.ignorePick = true;
}