/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.CylinderDragger');
goog.require('Vizi.Picker');

Vizi.CylinderDragger = function(param) {
	
	param = param || {};
	
    Vizi.Picker.call(this, param);
    
    this.normal = param.normal || new THREE.Vector3(0, 1, 0);
    this.position = param.position || new THREE.Vector3;
    this.color = 0x0000aa;
}

goog.inherits(Vizi.CylinderDragger, Vizi.Picker);

Vizi.CylinderDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

    // And some helpers
	this.dragOffset = new THREE.Euler;
	this.currentOffset = new THREE.Euler;
	this.dragStartPoint = new THREE.Vector3;
}

Vizi.CylinderDragger.prototype.update = function()
{
}

Vizi.CylinderDragger.prototype.onMouseDown = function(event) {
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	this.handleMouseDown(event);
}

Vizi.CylinderDragger.prototype.handleMouseDown = function(event) {
	
	var hitpoint = event.point.clone();
	this.lastHitPoint = hitpoint.clone();
	
//	console.log("event.point: ", event.point);

	this.dragPlane = new THREE.Plane(this.normal);
	this.dragStartPoint = this.dragPlane.projectPoint(hitpoint);
	this.dragOffset.copy(this._object.transform.rotation);

	
	this.dragStartPoint = this.dragPlane.projectPoint(hitpoint).normalize();
    this.dispatchEvent("dragstart", {
        type : "dragstart",
        offset : hitpoint
    });

    this.showarrows = false;
    
	if (this.showarrows) {
		
		if (this.arrowDecoration)
			this._object.removeComponent(this.arrowDecoration);
		
		var mesh = new THREE.ArrowHelper(this.normal, new THREE.Vector3, 500, 0x00ff00, 5, 5);
		var visual = new Vizi.Decoration({object:mesh});
		this._object.addComponent(visual);
		this.arrowDecoration = visual;
		
	}
}

Vizi.CylinderDragger.prototype.onMouseMove = function(event) {
	Vizi.Picker.prototype.onMouseMove.call(this, event);
	this.handleMouseMove(event);
}

Vizi.CylinderDragger.prototype.handleMouseMove = function(event) {
	var hitpoint = event.point.clone();

//	console.log("event.point: ", event.point);
	
	var projectedPoint = this.dragPlane.projectPoint(hitpoint).normalize();
	var theta = Math.acos(projectedPoint.dot(this.dragStartPoint));
	var cross = projectedPoint.clone().cross(this.dragStartPoint);
	if (this.normal.dot(cross) > 0)
		theta = -theta;
	
	this.currentOffset.set(this.dragOffset.x + this.normal.x * theta, 
			this.dragOffset.y + this.normal.y * theta,
			this.dragOffset.z + this.normal.z * theta);
		
	this.dispatchEvent("drag", {
			type : "drag", 
			offset : this.currentOffset,
		}
	);
}

Vizi.CylinderDragger.prototype.onMouseUp = function(event) {
	Vizi.Picker.prototype.onMouseUp.call(this, event);
	this.handleMouseUp(event);
}

Vizi.CylinderDragger.prototype.handleMouseUp = function(event) {
	this._object._parent.transform.object.remove(this.dragCylinder);
}

Vizi.CylinderDragger.prototype.onTouchStart = function(event) {
	Vizi.Picker.prototype.onTouchStart.call(this, event);

	this.handleMouseDown(event);
}

Vizi.CylinderDragger.prototype.onTouchMove = function(event) {
	Vizi.Picker.prototype.onTouchMove.call(this, event);

	this.handleMouseMove(event);
}

Vizi.CylinderDragger.prototype.onTouchEnd = function(event) {
	Vizi.Picker.prototype.onTouchEnd.call(this, event);

	this.handleMouseUp(event);
}

Vizi.CylinderDragger.SHOW_DRAG_CYLINDER = false;
