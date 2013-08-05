/**
 * @fileoverview Base class for visual elements.
 * @author Tony Parisi
 */
goog.provide('Vizi.SceneComponent');
goog.require('Vizi.Component');

/**
 * @constructor
 */
Vizi.SceneComponent = function(param)
{	
	param = param || {};

	Vizi.Component.call(this, param);
    
    this.object = null;
    this.position = this.param.position || new THREE.Vector3();
    this.rotation = this.param.rotation || new THREE.Vector3();
    this.scale = this.param.scale || new THREE.Vector3(1, 1, 1);
    this.autoUpdateTransform = true;
    this.layer = param.layer;
} ;

goog.inherits(Vizi.SceneComponent, Vizi.Component);

Vizi.SceneComponent.prototype.realize = function()
{
	if (this.object && !this.object.data)
	{
		this.addToScene();
	}
	
	Vizi.Component.prototype.realize.call(this);
}

Vizi.SceneComponent.prototype.update = function()
{	
	Vizi.Component.prototype.update.call(this);
	
	if (this.object && this.autoUpdateTransform)
	{
		this.object.position.x = this.position.x;
		this.object.position.y = this.position.y;
		this.object.position.z = this.position.z;
		this.object.rotation.x = this.rotation.x;
		this.object.rotation.y = this.rotation.y;
		this.object.rotation.z = this.rotation.z;
		this.object.scale.x = this.scale.x;
		this.object.scale.y = this.scale.y;
		this.object.scale.z = this.scale.z;
	}
	else
	{
		var debug = 1;
	}
}

Vizi.SceneComponent.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._entity)
	{
		var parent = this._entity.transform ? this._entity.transform.object : scene;
		if (parent)
		{
		    parent.add(this.object);
		    this.object.data = this; // backpointer for picking and such
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}

Vizi.SceneComponent.prototype.removeFromScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._entity)
	{
		var parent = this._entity.transform ? this._entity.transform.object : scene;
		if (parent)
		{
			this.object.data = null;
		    parent.remove(this.object);
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}
