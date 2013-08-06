/**
 * @fileoverview Base class for visual elements.
 * @author Tony Parisi
 */
goog.provide('Vizi.Visual');
goog.require('Vizi.SceneComponent');

/**
 * @constructor
 */
Vizi.Visual = function(param)
{
	Vizi.SceneComponent.call(this, param);	
} ;

goog.inherits(Vizi.Visual, Vizi.SceneComponent);
