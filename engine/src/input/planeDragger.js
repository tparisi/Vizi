/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PlaneDragger');
goog.require('Vizi.Picker');

Vizi.PlaneDragger = function(param) {
    Vizi.Picker.call(this, param);
}

goog.inherits(Vizi.PlaneDragger, Vizi.Picker);

Vizi.PlaneDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

	// Create a projector object
    this.projector = new THREE.Projector();
	
    // And some helpers
	this.dragOffset = new THREE.Vector3;
	this.dragHitPoint = new THREE.Vector3;
	this.dragStartPoint = new THREE.Vector3;
	this.dragPlane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
	this.dragPlane.visible = false;
	this._object.transform.object.add(this.dragPlane);
}

Vizi.PlaneDragger.prototype.update = function()
{
}

Vizi.PlaneDragger.prototype.onMouseMove = function(event)
{
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragHitPoint.copy(intersection.point).sub(this.dragOffset);
		this.dragHitPoint.add(this.dragStartPoint);
		this.dispatchEvent("drag", this.dragHitPoint);
	}
}

Vizi.PlaneDragger.prototype.onMouseDown = function(event)
{
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragOffset.copy(intersection.point).sub( this.dragPlane.position );
		this.dragStartPoint.copy(event.point);
	}
}


