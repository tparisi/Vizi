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
	param = param || {};
	
	Vizi.SceneComponent.call(this, param);
	
	this.geometry = param.geometry;
	this.material = param.material;
}

goog.inherits(Vizi.Visual, Vizi.SceneComponent);

Vizi.Visual.prototype.realize = function()
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	if (this.geometry && this.material)
	{
		this.object = new THREE.Mesh(this.geometry, this.material);
	    this.addToScene();
	}	
}