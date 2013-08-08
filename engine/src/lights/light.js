goog.provide('Vizi.Light');
goog.require('Vizi.SceneComponent');

Vizi.Light = function(param)
{
	param = param || {};
	Vizi.SceneComponent.call(this, param);
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        color: {
	        get: function() {
	            return this.object.color;
	        }
    	},
        intensity: {
	        get: function() {
	            return this.object.intensity;
	        },
	        set: function(v) {
	        	this.object.intensity = v;
	        }
    	},    	

    });
	
}

goog.inherits(Vizi.Light, Vizi.SceneComponent);

Vizi.Light.prototype._componentProperty = "light";
Vizi.Light.prototype._componentPropertyType = "Light";

Vizi.Light.prototype.realize = function() 
{
	Vizi.SceneComponent.prototype.realize.call(this);
}

Vizi.Light.DEFAULT_COLOR = 0xFFFFFF;
Vizi.Light.DEFAULT_INTENSITY = 1;
Vizi.Light.DEFAULT_RANGE = 10000;