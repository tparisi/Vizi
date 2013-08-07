/**
 *
 */
goog.provide('Vizi.Transform');
goog.require('Vizi.Component');

Vizi.Transform = function(param)
{
	param = param || {};
	
    Vizi.Component.call(this);
    
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
    
	this.object = new THREE.Object3D();
    this.layer = param.layer;
} ;

goog.inherits(Vizi.Transform, Vizi.Component);

Vizi.Transform.prototype._componentProperty = "transform";
Vizi.Transform.prototype._componentPropertyType = "Transform";

Vizi.Transform.prototype.realize = function()
{
	this.addToScene();

	Vizi.Component.prototype.realize.call(this);
}

Vizi.Transform.prototype.update = function()
{
}

Vizi.Transform.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = (this._object._parent && this._object._parent.transform) ? this._object._parent.transform.object : scene;
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

Vizi.Transform.prototype.removeFromScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = (this._object._parent && this._object._parent.transform) ? this._object._parent.transform.object : scene;
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
