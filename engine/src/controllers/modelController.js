
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
	this.enabled = (param.enabled !== undefined) ? param.enabled : true;
	this.allowPan = (param.allowPan !== undefined) ? param.allowPan : true;
	this.allowZoom = (param.allowZoom !== undefined) ? param.allowZoom : true;
	this.oneButton = (param.oneButton !== undefined) ? param.oneButton : true;
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

Vizi.ModelControllerScript.prototype.addCamera = function(camera) {
	this.cameras.push(camera);
	if (this.camera == null) {
		this._camera = camera;
		
		this._camera.position.set(0, this.radius / 2, this.radius);
		
	}
	
	var controls = this.createControls(camera);
	this.controlsList.push(controls);
	if (this.controls == null) {
		this.controls = controls;
	}
}

Vizi.ModelControllerScript.prototype.addCameras = function(cameras) {
	this.cameras = this.cameras.concat(cameras);
	if (this.camera == null) {
		this._camera = cameras[0];
		
		this._camera.position.set(0, this.radius / 2, this.radius);
	}
	
	var i, len = this.cameras.length;
	for (i = 0; i < len; i++) {
		var controls = this.createControls(this.cameras[i]);

		this.controlsList.push(controls);
		if (this.controls == null) {
			this.controls = controls;
		}
	}
}

Vizi.ModelControllerScript.prototype.createControls = function(camera)
{
	var controls = new Vizi.OrbitControls(camera.object, Vizi.Graphics.instance.container);
	controls.enabled = this.enabled;
	controls.userMinY = this.minY;
	controls.userMinZoom = this.minZoom;
	controls.userMaxZoom = this.maxZoom;
	controls.oneButton = this.oneButton;
	controls.userPan = this.allowPan;
	controls.userZoom = this.allowZoom;
	
	return controls;
}

Vizi.ModelControllerScript.prototype.update = function()
{
	this.controls.update();
	if (this._headlightOn)
	{
//		this.headlight.direction.copy(this._camera.position).negate();
	}	
}

Vizi.ModelControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this.createControls();
}

Vizi.ModelControllerScript.prototype.useCamera = function(camera) {
	this._camera = camera;
	this._camera.active = true;
	var index = this.cameras.indexOf(camera);
	if (index) {
		this.controls.enabled = false;
		this.controls = this.controlsList[index];
		this.controls.enabled = true;
	}
}

Vizi.ModelControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

Vizi.ModelControllerScript.default_radius = 10;
Vizi.ModelControllerScript.default_min_radius = 1;
Vizi.ModelControllerScript.MAX_X_ROTATION = 0; // Math.PI / 12;
Vizi.ModelControllerScript.MIN_X_ROTATION = -Math.PI / 2;
Vizi.ModelControllerScript.MAX_Y_ROTATION = Math.PI * 2;
Vizi.ModelControllerScript.MIN_Y_ROTATION = -Math.PI * 2;
