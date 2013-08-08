goog.provide('Vizi.Camera');
goog.require('Vizi.SceneComponent');

Vizi.Camera = function(param)
{
	param = param || {};
	
	Vizi.SceneComponent.call(this, param);

	this.active = param.active || false;
	var position = param.position || Vizi.Camera.DEFAULT_POSITION;
    this.position.copy(position);	
}

goog.inherits(Vizi.Camera, Vizi.SceneComponent);

Vizi.Camera.prototype.realize = function() 
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	this.addToScene();
	
	if (this.active)
	{
		Vizi.Graphics.instance.camera = this.object;
	}
}

Vizi.Camera.prototype.setActive = function(active) 
{
	this.active = active;
	if (this._realized && this.active)
	{
		Vizi.Graphics.instance.camera = this.object;
	}
}

Vizi.Camera.prototype.lookAt = function(v) 
{
	this.object.lookAt(v);
}

Vizi.Camera.DEFAULT_POSITION = new THREE.Vector3(0, 0, 10);
Vizi.Camera.DEFAULT_NEAR = 1;
Vizi.Camera.DEFAULT_FAR = 4000;
