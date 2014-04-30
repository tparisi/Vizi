
goog.require('Vizi.Prefabs');

Vizi.Prefabs.ModelController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.ModelControllerScript(param);
	controller.addComponent(controllerScript);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new Vizi.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
	
	return controller;
}

goog.provide('Vizi.ModelControllerScript');
goog.require('Vizi.Script');

Vizi.ModelControllerScript = function(param)
{
	Vizi.Script.call(this, param);

	this.radius = param.radius || Vizi.ModelControllerScript.default_radius;
	this.minRadius = param.minRadius || Vizi.ModelControllerScript.default_min_radius;
	this.minAngle = (param.minAngle !== undefined) ? param.minAngle : 
		Vizi.ModelControllerScript.default_min_angle;
	this.maxAngle = (param.maxAngle !== undefined) ? param.maxAngle : 
		Vizi.ModelControllerScript.default_max_angle;
	this.minDistance = (param.minDistance !== undefined) ? param.minDistance : 
		Vizi.ModelControllerScript.default_min_distance;
	this.maxDistance = (param.maxDistance !== undefined) ? param.maxDistance : 
		Vizi.ModelControllerScript.default_max_distance;
	this.allowPan = (param.allowPan !== undefined) ? param.allowPan : true;
	this.allowZoom = (param.allowZoom !== undefined) ? param.allowZoom : true;
	this.allowRotate = (param.allowRotate !== undefined) ? param.allowRotate : true;
	this.oneButton = (param.oneButton !== undefined) ? param.oneButton : true;
	this._enabled = (param.enabled !== undefined) ? param.enabled : true;
	this._headlightOn = param.headlight;
	this.cameras = [];
	this.controlsList = [];
	
    Object.defineProperties(this, {
    	camera: {
			get : function() {
				return this._camera;
			},
			set: function(camera) {
				this.setCamera(camera);
			}
		},
    	center : {
    		get: function() {
    			return this.controls.center;
    		},
    		set: function(c) {
    			this.controls.center.copy(c);
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

goog.inherits(Vizi.ModelControllerScript, Vizi.Script);

Vizi.ModelControllerScript.prototype.realize = function()
{
	this.headlight = this._object.getComponent(Vizi.DirectionalLight);
	this.headlight.intensity = this._headlightOn ? 1 : 0;
}

Vizi.ModelControllerScript.prototype.createControls = function(camera)
{
	var controls = new Vizi.OrbitControls(camera.object, Vizi.Graphics.instance.container);
	controls.userMinY = this.minY;
	controls.userMinZoom = this.minZoom;
	controls.userMaxZoom = this.maxZoom;
	controls.minPolarAngle = this.minAngle;
	controls.maxPolarAngle = this.maxAngle;	
	controls.minDistance = this.minDistance;	
	controls.maxDistance = this.maxDistance;	
	controls.oneButton = this.oneButton;
	controls.userPan = this.allowPan;
	controls.userZoom = this.allowZoom;
	controls.userRotate = this.allowRotate;
	
	return controls;
}

Vizi.ModelControllerScript.prototype.update = function()
{
	this.controls.update();
	if (this._headlightOn)
	{
		this.headlight.direction.copy(this._camera.position).negate();
	}	
}

Vizi.ModelControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this._camera.position.set(0, this.radius / 2, this.radius);
	this.controls = this.createControls(camera);
}

Vizi.ModelControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

Vizi.ModelControllerScript.prototype.setEnabled = function(enabled)
{
	this._enabled = enabled;
	this.controls.enabled = enabled;
}

Vizi.ModelControllerScript.default_radius = 10;
Vizi.ModelControllerScript.default_min_radius = 1;
Vizi.ModelControllerScript.default_min_angle = 0;
Vizi.ModelControllerScript.default_max_angle = Math.PI;
Vizi.ModelControllerScript.default_min_distance = 0;
Vizi.ModelControllerScript.default_max_distance = Infinity;
Vizi.ModelControllerScript.MAX_X_ROTATION = 0; // Math.PI / 12;
Vizi.ModelControllerScript.MIN_X_ROTATION = -Math.PI / 2;
Vizi.ModelControllerScript.MAX_Y_ROTATION = Math.PI * 2;
Vizi.ModelControllerScript.MIN_Y_ROTATION = -Math.PI * 2;
