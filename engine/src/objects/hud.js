/**
 * @fileoverview Object collects a group of Components that define an object and its behaviors
 * 
 * @author Tony Parisi
 */


goog.require('Vizi.Prefabs');

Vizi.Prefabs.HUD = function(param) {

	param = param || {};
	
	var hud = new Vizi.Object();

	var hudScript = new Vizi.HUDScript(param);
	hud.addComponent(hudScript);
	
	return hud;
}

goog.provide('Vizi.HUDScript');
goog.require('Vizi.Script');

Vizi.HUDScript = function(param) {
	
	Vizi.Script.call(this, param);

	this.zDistance = (param.zDistance !== undefined) ? param.zDistance : Vizi.HUDScript.DEFAULT_Z_DISTANCE;
	this.position = new THREE.Vector3(0, 0, -this.zDistance);
	this.scale = new THREE.Vector3;
	this.quaternion = new THREE.Quaternion;
}

goog.inherits(Vizi.HUDScript, Vizi.Script);

Vizi.HUDScript.prototype.realize = function() {
}

Vizi.HUDScript.prototype.update = function() {
	
	var cam = Vizi.Graphics.instance.camera;
	
	cam.updateMatrixWorld();
	
	cam.matrixWorld.decompose(this.position, this.quaternion, this.scale);
	
	this._object.transform.quaternion.copy(this.quaternion);
	this._object.transform.position.copy(this.position);
	this._object.transform.translateZ(-this.zDistance);
}

Vizi.HUDScript.DEFAULT_Z_DISTANCE = 1;

