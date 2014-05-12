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
	this.dragPlane = new THREE.Plane(this.normal);
}

Vizi.CylinderDragger.prototype.update = function()
{
}

Vizi.CylinderDragger.prototype.createDragCylinder = function() {

	var height = 2000;
	var radialSegments = 32;
	var normal = this.normal;
	
	var radius = this.dragStartPoint.length();
	var geom = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
	var mat = new THREE.MeshBasicMaterial({color:this.color, transparent: true, side:THREE.DoubleSide, opacity:0.2 });

	var mesh = new THREE.Mesh(geom, mat);

	var up = this.normal.clone();
	up.applyEuler(this._object.transform.object.rotation);
	// Hack city
	if (this._object.visuals[0])
		up.applyEuler(this._object.visuals[0].object.rotation);
	var lookat = new THREE.Vector3(0, up.z, -up.y).normalize();
	if (!lookat.lengthSq())
		lookat.set(0, up.x, up.y).normalize();
	
	mesh.up.copy(up);
	mesh.lookAt(lookat);
	
	return mesh;
}

Vizi.CylinderDragger.prototype.onMouseDown = function(event) {
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	this.handleMouseDown(event);
}

Vizi.CylinderDragger.prototype.handleMouseDown = function(event) {
	
	var hitpoint = event.point.clone();
	var modelMat = new THREE.Matrix4;
	modelMat.getInverse(this._object.transform.object.matrixWorld);
	hitpoint.applyMatrix4(modelMat);
	this.lastHitPoint = hitpoint.clone();
	
	//console.log("event.point: ", event.point);
	
	this.dragStartPoint = this.dragPlane.projectPoint(hitpoint);
	this.dragOffset.copy(this._object.transform.rotation);
	
	//console.log("dragStartPoint: ", this.dragStartPoint);

	if (this.dragCylinder) {
		this._object._parent.transform.object.remove(this.dragCylinder);
	}
	
	this.dragCylinder = this.createDragCylinder();
	this.dragStartPoint.normalize();
	this._object._parent.transform.object.add(this.dragCylinder);
	this.dragCylinder.position.copy(this._object.transform.position);
	this.dragCylinder.scale.copy(this._object.transform.scale);
	this.dragCylinder.updateMatrixWorld();
	this.dragCylinder.ignorePick = true;
	//this.dragCylinder.visible = false;
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragCylinder);	
	
	if (intersection) {
		if (intersection.point)
			this.lastHitPoint = intersection.point.clone();
		var hitpoint = intersection.point ? intersection.point.clone() : this.lastHitPoint.clone();
		
		this.dragStartPoint = this.dragPlane.projectPoint(hitpoint).normalize();
        this.dispatchEvent("dragstart", {
            type : "dragstart",
            offset : hitpoint
        });
	}
}

Vizi.CylinderDragger.prototype.onMouseMove = function(event) {
	Vizi.Picker.prototype.onMouseMove.call(this, event);
	this.handleMouseMove(event);
}

Vizi.CylinderDragger.prototype.handleMouseMove = function(event) {
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragCylinder);	
	
	if (intersection) {

		if (intersection.point)
			this.lastHitPoint = intersection.point.clone();
		var hitpoint = intersection.point ? intersection.point.clone() : this.lastHitPoint.clone();
		
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

