goog.provide('Vizi.DirectionalLight');
goog.require('Vizi.Light');

Vizi.DirectionalLight = function(param)
{
	param = param || {};

	this.scaledDir = new THREE.Vector3;
	this.castShadows = ( param.castShadows !== undefined ) ? param.castShadows : Vizi.DirectionalLight.DEFAULT_CAST_SHADOWS;
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
		this.direction = param.object.position.clone().normalize().negate();
		this.targetPos = param.object.target.position.clone();
		this.shadowDarkness = param.object.shadowDarkness;
	}
	else {
		this.direction = param.direction || new THREE.Vector3(0, 0, -1);
		this.object = new THREE.DirectionalLight(param.color, param.intensity, 0);
		this.targetPos = new THREE.Vector3;
		this.shadowDarkness = ( param.shadowDarkness !== undefined ) ? param.shadowDarkness : Vizi.DirectionalLight.DEFAULT_SHADOW_DARKNESS;
	}
}

goog.inherits(Vizi.DirectionalLight, Vizi.Light);

Vizi.DirectionalLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.DirectionalLight.prototype.update = function() 
{
	// D'oh Three.js doesn't seem to transform light directions automatically
	// Really bizarre semantics
	this.position.copy(this.direction).normalize().negate();
	var worldmat = this.object.parent.matrixWorld;
	this.position.applyMatrix4(worldmat);
	this.scaledDir.copy(this.direction);
	this.scaledDir.multiplyScalar(Vizi.Light.DEFAULT_RANGE);
	this.targetPos.copy(this.position);
	this.targetPos.add(this.scaledDir);	
 	this.object.target.position.copy(this.targetPos);

	this.updateShadows();
	
	Vizi.Light.prototype.update.call(this);
}

Vizi.DirectionalLight.prototype.updateShadows = function()
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


Vizi.DirectionalLight.DEFAULT_CAST_SHADOWS = false;
Vizi.DirectionalLight.DEFAULT_SHADOW_DARKNESS = 0.3;
