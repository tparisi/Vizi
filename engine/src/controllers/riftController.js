
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
	this.oculusBridge = null;
	
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
	this.bodyAngle     = 0;
	this.bodyAxis      = new THREE.Vector3(0, 1, 0);
	this.bodyPosition  = new THREE.Vector3(0, 15, 0);
	this.velocity      = new THREE.Vector3();
	
	var that = this;
	var bridgeOrientationUpdated = function(quatValues) {
		that.bridgeOrientationUpdated(quatValues);
	}
	var bridgeConfigUpdated = function(quatValues) {
		that.bridgeConfigUpdated(quatValues);
	}
	var bridgeConnected = function(quatValues) {
		that.bridgeConnected(quatValues);
	}
	var bridgeDisconnected = function(quatValues) {
		that.bridgeDisconnected(quatValues);
	}

	this.oculusBridge = new OculusBridge({
		"debug" : true,
		"onOrientationUpdate" : bridgeOrientationUpdated,
		"onConfigUpdate"      : bridgeConfigUpdated,
		"onConnect"           : bridgeConnected,
		"onDisconnect"        : bridgeDisconnected
	});
	
	this.oculusBridge.connect();
	
}

Vizi.RiftControllerScript.prototype.update = function()
{
	if (this._enabled) {
	}
}

Vizi.RiftControllerScript.prototype.setEnabled = function(enabled)
{
	this._enabled = enabled;
}

Vizi.RiftControllerScript.prototype.setCamera = function(camera) {
	this._camera = camera;
}

Vizi.RiftControllerScript.prototype.bridgeOrientationUpdated = function(quatValues) {

	// Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

	// TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

	// make a quaternion for the the body angle rotated about the Y axis.
	var quat = new THREE.Quaternion();
	quat.setFromAxisAngle(this.bodyAxis, this.bodyAngle);

	// make a quaternion for the current orientation of the Rift
	var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

	// multiply the body rotation by the Rift rotation.
	quat.multiply(quatCam);

	// Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
	var xzVector = new THREE.Vector3(0, 0, 1);
	xzVector.applyQuaternion(quat);

	// Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
	// so you can steer with a combination of the keyboard and by moving your head.
	viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;

	// Apply the combined look/body angle to the camera.
	this._camera.quaternion.copy(quat);
	
	console.log("quat", quat);
}

Vizi.RiftControllerScript.prototype.bridgeConnected = function() {
//  document.getElementById("logo").className = "";
}

Vizi.RiftControllerScript.prototype.bridgeDisconnected = function() {
//  document.getElementById("logo").className = "offline";
}

Vizi.RiftControllerScript.prototype.bridgeConfigUpdated = function(config) {
// console.log("Oculus config updated.");
// riftCam.setHMD(config);      
}

