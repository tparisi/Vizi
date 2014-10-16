
goog.require('Vizi.Prefabs');

Vizi.Prefabs.DeviceOrientationController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.DeviceOrientationControllerScript(param);
	controller.addComponent(controllerScript);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new Vizi.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
		
	return controller;
}

goog.provide('Vizi.DeviceOrientationControllerScript');
goog.require('Vizi.Script');

Vizi.DeviceOrientationControllerScript = function(param)
{
	Vizi.Script.call(this, param);

	this._enabled = (param.enabled !== undefined) ? param.enabled : true;
	this._headlightOn = param.headlight;
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

goog.inherits(Vizi.DeviceOrientationControllerScript, Vizi.Script);

Vizi.DeviceOrientationControllerScript.prototype.realize = function() {
	this.headlight = this._object.getComponent(Vizi.DirectionalLight);
	this.headlight.intensity = this._headlightOn ? 1 : 0;
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

	if (this._headlightOn)
	{
		this.headlight.direction.copy(this._camera.position).negate();
	}	
}

Vizi.DeviceOrientationControllerScript.prototype.setEnabled = function(enabled)
{
	this._enabled = enabled;
	if (this._enabled)
		this.controls.connect();
	else
		this.controls.disconnect();
}

Vizi.DeviceOrientationControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

Vizi.DeviceOrientationControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this.controls = this.createControls(camera);
}
