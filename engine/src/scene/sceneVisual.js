/**
 * @fileoverview A visual containing a model in Collada format
 * @author Tony Parisi
 */
goog.provide('Vizi.SceneVisual');
goog.require('Vizi.Visual');

Vizi.SceneVisual = function(param) 
{
	param = param || {};
	
    Vizi.Visual.call(this, param);

    this.object = param.scene;
}

goog.inherits(Vizi.SceneVisual, Vizi.Visual);

Vizi.SceneVisual.prototype.realize = function()
{
	Vizi.Visual.prototype.realize.call(this);
	
    this.addToScene();
}
