goog.provide('Vizi.AmbientLight');
goog.require('Vizi.Light');

Vizi.AmbientLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
	}
	else {
		this.object = new THREE.AmbientLight(param.color);
	}
}

goog.inherits(Vizi.AmbientLight, Vizi.Light);

Vizi.AmbientLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}
