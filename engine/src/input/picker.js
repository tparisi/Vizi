/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Picker');
goog.require('Vizi.Component');

Vizi.Picker = function(param) {
	param = param || {};
	
    Vizi.Component.call(this, param);
    this.overCursor = param.overCursor;
    this.enabled = (param.enabled !== undefined) ? param.enabled : true;
}

goog.inherits(Vizi.Picker, Vizi.Component);

Vizi.Picker.prototype._componentCategory = "pickers";

Vizi.Picker.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	
    this.lastHitPoint = new THREE.Vector3;
    this.lastHitNormal = new THREE.Vector3;
    this.lastHitFace = new THREE.Face3;
}

Vizi.Picker.prototype.update = function()
{
}

Vizi.Picker.prototype.onMouseOver = function(event)
{
    this.dispatchEvent("mouseover", event);
}

Vizi.Picker.prototype.onMouseOut = function(event)
{
    this.dispatchEvent("mouseout", event);
}
	        	        
Vizi.Picker.prototype.onMouseMove = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (this._object == Vizi.PickManager.clickedObject || this._object == mouseOverObject)
	{
		if (event.point)
			this.lastHitPoint.copy(event.point);
		if (event.normal)
			this.lastHitNormal.copy(event.normal);
		if (event.face)
			this.lastHitFace = event.face;

		if (event.point) {
			this.dispatchEvent("mousemove", event);
		}
	}
}

Vizi.Picker.prototype.onMouseDown = function(event)
{
	this.lastHitPoint.copy(event.point);
	if (event.normal)
		this.lastHitNormal.copy(event.normal);
	if (event.face)
		this.lastHitFace = event.face;
	
    this.dispatchEvent("mousedown", event);
}

Vizi.Picker.prototype.onMouseUp = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject != this._object)
	{
		event.point = this.lastHitPoint;
		event.normal = this.lastHitNormal;
		event.face = this.lastHitNormal;
		this.dispatchEvent("mouseout", event);
	}

	this.dispatchEvent("mouseup", event);
}

Vizi.Picker.prototype.onMouseClick = function(event)
{
	this.lastHitPoint.copy(event.point);
	if (event.normal)
		this.lastHitNormal.copy(event.normal);
	if (event.face)
		this.lastHitFace = event.face;

	this.dispatchEvent("click", event);
}
	        
Vizi.Picker.prototype.onMouseDoubleClick = function(event)
{
	this.lastHitPoint.copy(event.point);
	if (event.normal)
		this.lastHitNormal.copy(event.normal);
	if (event.face)
		this.lastHitFace = event.face;

	this.dispatchEvent("dblclick", event);
}
	
Vizi.Picker.prototype.onMouseScroll = function(event)
{
    this.dispatchEvent("mousescroll", event);
}

Vizi.Picker.prototype.onTouchMove = function(event)
{
	this.dispatchEvent("touchmove", event);
}

Vizi.Picker.prototype.onTouchStart = function(event)
{	
    this.dispatchEvent("touchstart", event);
}

Vizi.Picker.prototype.onTouchEnd = function(event)
{
	this.dispatchEvent("touchend", event);
}


