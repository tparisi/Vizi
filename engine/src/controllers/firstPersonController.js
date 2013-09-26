
goog.require('Vizi.Prefabs');

Vizi.Prefabs.FirstPersonController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.FirstPersonControllerScript(param);
	controller.addComponent(controllerScript);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new Vizi.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
	
	return controller;
}

goog.provide('Vizi.FirstPersonControllerScript');
goog.require('Vizi.Script');

Vizi.FirstPersonControllerScript = function(param)
{
	Vizi.Script.call(this, param);
	
    Object.defineProperties(this, {
    	camera: {
			get : function() {
				return this._camera;
			},
			set: function(camera) {
				this.setCamera(camera);
			}
		},
        headlightOn: {
	        get: function() {
	            return this._headlightOn;
	        },
	        set:function(v)
	        {
	        	this.setHeadlightOn(v);
	        }
    	},
    });
}

goog.inherits(Vizi.FirstPersonControllerScript, Vizi.Script);

Vizi.FirstPersonControllerScript.prototype.realize = function()
{
	this.headlight = this._object.getComponent(Vizi.DirectionalLight);
	this.headlight.intensity = this._headlightOn ? 1 : 0;
}

Vizi.FirstPersonControllerScript.prototype.createControls = function(camera)
{
	var controls = new Vizi.FirstPersonControls(camera.object, Vizi.Graphics.instance.container);
	this.clock = new THREE.Clock();
	return controls;
}

Vizi.FirstPersonControllerScript.prototype.update = function()
{
	this.controls.update(this.clock.getDelta());
	if (this._headlightOn)
	{
		this.headlight.direction.copy(this._camera.position).negate();
	}	
}

Vizi.FirstPersonControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this.controls = this.createControls(camera);
	this.controls.movementSpeed = 10;
	this.controls.lookSpeed = 0.01;

}

Vizi.FirstPersonControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

