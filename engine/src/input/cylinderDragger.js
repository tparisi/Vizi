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
    this.color = 0x888888;
}

goog.inherits(Vizi.CylinderDragger, Vizi.Picker);

Vizi.CylinderDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

    // And some helpers
	this.dragOffset = new THREE.Euler;
	this.dragStartPoint = new THREE.Vector3;
	this.dragPlane = new THREE.Plane(this.normal);
}


Vizi.CylinderDragger.prototype.update = function()
{
}

Vizi.CylinderDragger.prototype.onMouseDown = function(event)
{
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	
	var hitpoint = event.point.clone();
	this.lastHitPoint = event.point.clone();
	this.dragStartPoint = this.dragPlane.projectPoint(hitpoint).normalize();
}

Vizi.CylinderDragger.prototype.onMouseMove = function(event)
{
	Vizi.Picker.prototype.onMouseMove.call(this, event);
	
	if (event.point)
		this.lastHitPoint = event.point.clone();
	var hitpoint = event.point ? event.point.clone() : this.lastHitPoint.clone();
	
	var projectedPoint = this.dragPlane.projectPoint(hitpoint).normalize();
	var theta = Math.acos(this.dragStartPoint.dot(projectedPoint));
	var cross = this.dragStartPoint.clone().cross(projectedPoint);
	if (this.normal.dot(cross) > 0)
		theta = -theta;
	
	this.dragOffset.set(this.normal.x * theta, this.normal.y * theta, this.normal.z * theta);
		
	this.dispatchEvent("drag", {
			type : "drag", 
			offset : this.dragOffset,
		}
	);
}



