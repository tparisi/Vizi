goog.provide('Vizi.Camera');
goog.require('Vizi.SceneComponent');

Vizi.Camera = function(param)
{
	param = param || {};
	
	Vizi.SceneComponent.call(this, param);

    // Accessors
    Object.defineProperties(this, {
        active: {
	        get: function() {
	            return this._active;
	        },
	        set: function(v) {
	        	this._active = v;
	        	if (this._realized && this._active)
	        	{
	        		Vizi.CameraManager.setActiveCamera(this);
	        	}
	        }
    	},    	

    });
	
	this._active = param.active || false;
	var position = param.position || Vizi.Camera.DEFAULT_POSITION;
    this.position.copy(position);	
}

goog.inherits(Vizi.Camera, Vizi.SceneComponent);

Vizi.Camera.prototype._componentProperty = "camera";
Vizi.Camera.prototype._componentPropertyType = "Camera";

Vizi.Camera.prototype.realize = function() 
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	this.addToScene();
	
	Vizi.CameraManager.addCamera(this);
	
	if (this._active)
	{
		Vizi.CameraManager.setActiveCamera(this);
	}
}

Vizi.Camera.prototype.lookAt = function(v) 
{
	this.object.lookAt(v);
}

Vizi.Camera.DEFAULT_POSITION = new THREE.Vector3(0, 0, 10);
Vizi.Camera.DEFAULT_NEAR = 1;
Vizi.Camera.DEFAULT_FAR = 4000;
