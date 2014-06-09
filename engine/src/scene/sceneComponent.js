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
        up: {
	        get: function() {
	            return this.object.up;
	        },
	        set: function(v) {
	            this.object.up = v;
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
        visible: {
	        get: function() {
	            return this.object.visible;
	        },
	        set: function(v) {
	            this.object.visible = v;
	        }
    	},    	
    	lookAt : {
    		value : function(v) {
    			this.object.lookAt(v);
    		}
    	},
    	translateOnAxis : {
    		value : function(a, d) {
    			this.object.translateOnAxis(a, d);
    		}
    	},
    	translateX : {
    		value : function(d) {
    			this.object.translateX(d);
    		}
    	},
    	translateY : {
    		value : function(d) {
    			this.object.translateY(d);
    		}
    	},
    	translateZ: {
    		value : function(d) {
    			this.object.translateZ(d);
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
	if (this._object) {
		
		// only add me if the object's transform component actually points
		// to a different Three.js object than mine
		if (this._object.transform.object != this.object) {

			var parent = this._object.transform ? this._object.transform.object : scene;
			
			if (parent) {
				
			    if (parent != this.object.parent)
			    	 parent.add(this.object);
			    
			    this.object.data = this; // backpointer for picking and such
			}
			else {
				// N.B.: throw something?
			}
		}
	}
	else {
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
	
	this._realized = false;
}
