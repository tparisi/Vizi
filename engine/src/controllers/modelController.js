
goog.require('Vizi.Prefabs');

Vizi.Prefabs.ModelController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var transform = new Vizi.Transform;
	controller.addComponent(transform);
	var controllerScript = new Vizi.ModelControllerScript(param);
	controller.addComponent(controllerScript);

	var timer = new Vizi.Timer( { duration : 3333 } );
	controller.addComponent(timer);

	var viewpoint = new Vizi.Object;
	var transform = new Vizi.Transform;
	var camera = new Vizi.PerspectiveCamera({active:param.active, fov: param.fov});
	viewpoint.addComponent(transform);
	viewpoint.addComponent(camera);

	controller.addChild(viewpoint);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new Vizi.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
	
	return controller;
}

goog.provide('Vizi.ModelControllerScript');
goog.require('Vizi.Component');

Vizi.ModelControllerScript = function(param)
{
	Vizi.Component.call(this, param);

	this.radius = param.radius || Vizi.ModelControllerScript.default_radius;
	this.minRadius = param.minRadius || Vizi.ModelControllerScript.default_min_radius;
	this.enabled = (param.enabled !== undefined) ? param.enabled : true;
	this._headlightOn = param.headlight;
	
    Object.defineProperties(this, {
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

goog.inherits(Vizi.ModelControllerScript, Vizi.Component);

Vizi.ModelControllerScript.prototype.realize = function()
{
	this.headlight = this._object.getComponent(Vizi.DirectionalLight);
	this.headlight.intensity = this._headlightOn ? 1 : 0;
	this.viewpoint = this._object.getChild(0);
	this.camera = this.viewpoint.camera;
		
	this.camera.position.set(0, 0, this.radius);
	
	this.controls = null;
	this.createControls();
	this.controls.enabled = this.enabled;
	this.controls.userMinY = this.minY;
	this.controls.userMinZoom = this.minZoom;
	this.controls.userMaxZoom = this.maxZoom;
}

Vizi.ModelControllerScript.prototype.createControls = function()
{
	this.controls = new Vizi.OrbitControls(this.camera.object, Vizi.Graphics.instance.container);
}

Vizi.ModelControllerScript.prototype.update = function()
{
	this.controls.update();
	if (this._headlightOn)
	{
		this.headlight.direction.copy(this.camera.position).negate();
	}	
}

Vizi.ModelControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

Vizi.ModelControllerScript.default_radius = 5;
Vizi.ModelControllerScript.default_min_radius = 1;
Vizi.ModelControllerScript.MAX_X_ROTATION = 0; // Math.PI / 12;
Vizi.ModelControllerScript.MIN_X_ROTATION = -Math.PI / 2;
Vizi.ModelControllerScript.MAX_Y_ROTATION = Math.PI * 2;
Vizi.ModelControllerScript.MIN_Y_ROTATION = -Math.PI * 2;
