goog.provide('Vizi.SpotLight');
goog.require('Vizi.Light');

Vizi.SpotLight = function(param)
{
	param = param || {};

	this.scaledDir = new THREE.Vector3;
	this.positionVec = new THREE.Vector3;
	this.castShadows = ( param.castShadows !== undefined ) ? param.castShadows : Vizi.SpotLight.DEFAULT_CAST_SHADOWS;
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
		this.direction = param.object.position.clone().normalize().negate();
		this.targetPos = param.object.target.position.clone();
		this.shadowDarkness = param.object.shadowDarkness;
	}
	else {
		this.direction = param.direction || new THREE.Vector3(0, 0, -1);
		this.targetPos = new THREE.Vector3;
		this.shadowDarkness = ( param.shadowDarkness !== undefined ) ? param.shadowDarkness : Vizi.SpotLight.DEFAULT_SHADOW_DARKNESS;

		var angle = ( param.angle !== undefined ) ? param.angle : Vizi.SpotLight.DEFAULT_ANGLE;
		var distance = ( param.distance !== undefined ) ? param.distance : Vizi.SpotLight.DEFAULT_DISTANCE;
		var exponent = ( param.exponent !== undefined ) ? param.exponent : Vizi.SpotLight.DEFAULT_EXPONENT;

		this.object = new THREE.SpotLight(param.color, param.intensity, distance, angle, exponent);
	}
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        angle: {
	        get: function() {
	            return this.object.angle;
	        },
	        set: function(v) {
	        	this.object.angle = v;
	        }
		},    	
        distance: {
	        get: function() {
	            return this.object.distance;
	        },
	        set: function(v) {
	        	this.object.distance = v;
	        }
    	},    	
        exponent: {
	        get: function() {
	            return this.object.exponent;
	        },
	        set: function(v) {
	        	this.object.exponent = v;
	        }
    	},    	

    });
	
}

goog.inherits(Vizi.SpotLight, Vizi.Light);

Vizi.SpotLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.SpotLight.prototype.update = function() 
{
	// D'oh Three.js doesn't seem to transform light directions automatically
	// Really bizarre semantics
	if (this.object)
	{
		this.positionVec.set(0, 0, 0);
		var worldmat = this.object.parent.matrixWorld;
		this.positionVec.applyMatrix4(worldmat);
		this.position.copy(this.positionVec);

		this.scaledDir.copy(this.direction);
		this.scaledDir.multiplyScalar(Vizi.Light.DEFAULT_RANGE);
		this.targetPos.copy(this.position);
		this.targetPos.add(this.scaledDir);	
		// this.object.target.position.copy(this.targetPos);
		
		this.updateShadows();
	}
	
	// Update the rest
	Vizi.Light.prototype.update.call(this);
}

Vizi.SpotLight.prototype.updateShadows = function()
{
	if (this.castShadows)
	{
		this.object.castShadow = true;
		this.object.shadowCameraNear = 1;
		this.object.shadowCameraFar = Vizi.Light.DEFAULT_RANGE;
		this.object.shadowCameraFov = 90;

		// light.shadowCameraVisible = true;

		this.object.shadowBias = 0.0001;
		this.object.shadowDarkness = this.shadowDarkness;

		this.object.shadowMapWidth = 1024;
		this.object.shadowMapHeight = 1024;
		
		Vizi.Graphics.instance.enableShadows(true);
	}	
}

Vizi.SpotLight.DEFAULT_DISTANCE = 0;
Vizi.SpotLight.DEFAULT_ANGLE = Math.PI / 2;
Vizi.SpotLight.DEFAULT_EXPONENT = 10;
Vizi.SpotLight.DEFAULT_CAST_SHADOWS = false;
Vizi.SpotLight.DEFAULT_SHADOW_DARKNESS = 0.3;
