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

	if (param.object) {
		this.object = param.object;
		this.geometry = this.object.geometry;
		this.material = this.object.material;
	}
	else {
		this.geometry = param.geometry;
		this.material = param.material;
	}
}

goog.inherits(Vizi.Visual, Vizi.SceneComponent);

// We're going to let this slide until we figure out the glTF mulit-material mesh
//Vizi.Visual.prototype._componentProperty = "visual";
//Vizi.Visual.prototype._componentPropertyType = "Visual";
Vizi.Visual.prototype._componentCategory = "visuals";

Vizi.Visual.prototype.realize = function()
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	if (!this.object && this.geometry && this.material) {
		this.object = new THREE.Mesh(this.geometry, this.material);
	    this.addToScene();
	}	
}

