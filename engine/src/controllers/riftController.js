
goog.require('Vizi.Prefabs');

Vizi.Prefabs.RiftController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.RiftControllerScript(param);
	controller.addComponent(controllerScript);
	
	return controller;
}

goog.provide('Vizi.RiftControllerScript');
goog.require('Vizi.Script');

Vizi.RiftControllerScript = function(param)
{
	Vizi.Script.call(this, param);

	this._enabled = (param.enabled !== undefined) ? param.enabled : true;
	this.riftControls = null;
	
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

goog.inherits(Vizi.RiftControllerScript, Vizi.Script);

Vizi.RiftControllerScript.prototype.realize = function()
{
}

Vizi.RiftControllerScript.prototype.update = function()
{
	if (this._enabled && this.riftControls) {
		this.riftControls.update();
	}
}

Vizi.RiftControllerScript.prototype.setEnabled = function(enabled)
{
	this._enabled = enabled;
}

Vizi.RiftControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
	this.riftControls = this.createControls(camera);
}

Vizi.RiftControllerScript.prototype.createControls = function(camera)
{
	var ok = true;
	
	var controls = new THREE.VRControls(camera.object, function(err) {
			if (err) {
				console.log(err);
				ok = false;
			}
		});

	// N.B.: this only works because the callback up there is synchronous...
	return ok ?  controls : null;
}


