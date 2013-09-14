goog.provide('Vizi.PointLight');
goog.require('Vizi.Light');

Vizi.PointLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);
	
	this.positionVec = new THREE.Vector3;
	
	if (param.object) {
		this.object = param.object; 
	}
	else {
		var distance = ( param.distance !== undefined ) ? param.distance : Vizi.PointLight.DEFAULT_DISTANCE;
		this.object = new THREE.PointLight(param.color, param.intensity, distance);
	}
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        distance: {
	        get: function() {
	            return this.object.distance;
	        },
	        set: function(v) {
	        	this.object.distance = v;
	        }
    	},    	

    });

}

goog.inherits(Vizi.PointLight, Vizi.Light);

Vizi.PointLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.PointLight.prototype.update = function() 
{
	if (this.object)
	{
		this.positionVec.set(0, 0, 0);
		var worldmat = this.object.parent.matrixWorld;
		this.positionVec.applyMatrix4(worldmat);
		this.position.copy(this.positionVec);
	}
	
	// Update the rest
	Vizi.Light.prototype.update.call(this);
}

Vizi.PointLight.DEFAULT_DISTANCE = 0;
