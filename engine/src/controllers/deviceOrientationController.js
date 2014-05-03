
goog.require('Vizi.Prefabs');

Vizi.Prefabs.DeviceOrientationController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.DeviceOrientationControllerScript(param);
	controller.addComponent(controllerScript);
	
	return controller;
}

goog.provide('Vizi.DeviceOrientationControllerScript');
goog.require('Vizi.Script');

Vizi.DeviceOrientationControllerScript = function(param)
{
	Vizi.Script.call(this, param);

	this._enabled = (param.enabled !== undefined) ? param.enabled : true;
	this.roll = (param.roll !== undefined) ? param.roll : true;
		
    Object.defineProperties(this, {
    	camera: {
			get : function() {
				return this._camera;
			},
			set: function(camera) {
				this.setCamera(camera);
			}
		},
    	enabled : {
    		get: function() {
    			return this._enabled;
    		},
    		set: function(v) {
    			this.setEnabled(v);
    		}
    	},
    });
}

goog.inherits(Vizi.DeviceOrientationControllerScript, Vizi.Script);

Vizi.DeviceOrientationControllerScript.prototype.realize = function()
{
}

Vizi.DeviceOrientationControllerScript.prototype.createControls = function(camera)
{
	var controls = new Vizi.DeviceOrientationControls(camera.object);
	
	if (this._enabled)
		controls.connect();
	
	controls.roll = this.roll;
	return controls;
}

Vizi.DeviceOrientationControllerScript.prototype.update = function()
{
	if (this._enabled)
		this.controls.update();
}

Vizi.DeviceOrientationControllerScript.prototype.setEnabled = function(enabled)
{
	this._enabled = enabled;
	if (this._enabled)
		this.controls.connect();
	else
		this.controls.disconnect();
}

Vizi.DeviceOrientationControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this.controls = this.createControls(camera);
}
