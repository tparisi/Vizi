/**
 * @fileoverview Base class for visual elements.
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

