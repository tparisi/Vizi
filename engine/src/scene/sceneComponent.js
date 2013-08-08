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
    
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        position: {
	        get: function() {
	            return this.object.position;
	        }
    	},
        rotation: {
	        get: function() {
	            return this.object.rotation;
	        }
    	},
        scale: {
	        get: function() {
	            return this.object.scale;
	        }
    	},
        quaternion: {
	        get: function() {
	            return this.object.quaternion;
	        }
    	},    	
        useQuaternion: {
	        get: function() {
	            return this.object.useQuaternion;
	        },
	        set: function(v) {
	            this.object.useQuaternion = v;
	        }
    	},    	

    });
    
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
}

Vizi.SceneComponent.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = this._object.transform ? this._object.transform.object : scene;
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
	if (this._object)
	{
		var parent = this._object.transform ? this._object.transform.object : scene;
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
