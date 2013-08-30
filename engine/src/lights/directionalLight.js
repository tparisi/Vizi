goog.provide('Vizi.DirectionalLight');
goog.require('Vizi.Light');

Vizi.DirectionalLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
		this.direction = param.object.position.clone().normalize().negate();
	}
	else {
		this.direction = param.direction || new THREE.Vector3(0, 0, -1);
		this.object = new THREE.DirectionalLight(param.color, param.intensity, 0);
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
	this.position.copy(this.direction).negate();
	this.object.target.position.copy(this.direction).multiplyScalar(Vizi.Light.DEFAULT_RANGE);
	var worldmat = this.object.parent.matrixWorld;
	this.position.applyMatrix4(worldmat);
	this.object.target.position.applyMatrix4(worldmat);
	
	Vizi.Light.prototype.update.call(this);
}

