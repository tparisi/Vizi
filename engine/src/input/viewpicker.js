/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.ViewPicker');
goog.require('Vizi.Component');

Vizi.ViewPicker = function(param) {
	param = param || {};
	
    Vizi.Component.call(this, param);

    this.enabled = (param.enabled !== undefined) ? param.enabled : true;

	this.position = new THREE.Vector3();
	this.mouse = new THREE.Vector3(0,0, 1);
	this.unprojectedMouse = new THREE.Vector3();

	this.raycaster = new THREE.Raycaster();
	this.projector = new THREE.Projector();

	this.over = false;
}

goog.inherits(Vizi.ViewPicker, Vizi.Component);

Vizi.ViewPicker.prototype._componentCategory = "pickers";

Vizi.ViewPicker.prototype.realize = function() {
	Vizi.Component.prototype.realize.call(this);
}

Vizi.ViewPicker.prototype.update = function() {

	this.unprojectMouse();
	var intersected = this.checkForIntersections(this.unprojectedMouse);

	if (intersected != this.over) {
		this.over = intersected;
		if (this.over) {
			this.onViewOver();
		}
		else {
			this.onViewOut();
		}
	}
}

Vizi.ViewPicker.prototype.unprojectMouse = function() {

	this.unprojectedMouse.copy(this.mouse);
	this.projector.unprojectVector(this.unprojectedMouse, Vizi.Graphics.instance.camera);
}

Vizi.ViewPicker.prototype.checkForIntersections = function(position) {

	var origin = position;
	var direction = origin.clone()
	var pos = new THREE.Vector3();
	pos.applyMatrix4(Vizi.Graphics.instance.camera.matrixWorld);
	direction.sub(pos);
	direction.normalize();

	this.raycaster.set(pos, direction);
	this.raycaster.near = Vizi.Graphics.instance.camera.near;
	this.raycaster.far = Vizi.Graphics.instance.camera.far;

	var intersected = this.raycaster.intersectObjects(this._object.transform.object.children);

	return (intersected.length > 0);
}

Vizi.ViewPicker.prototype.onViewOver = function() {
    this.dispatchEvent("viewover", { type : "viewover" });
}

Vizi.ViewPicker.prototype.onViewOut = function() {
    this.dispatchEvent("viewout", { type : "viewout" });
}

