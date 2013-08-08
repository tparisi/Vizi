/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Picker');
goog.require('Vizi.Component');

Vizi.Picker = function(param) {
    Vizi.Component.call(this, param);
}

goog.inherits(Vizi.Picker, Vizi.Component);

Vizi.Picker.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	
	this.overCursor = this.param.overCursor;
	
	if (this._object)
	{
		var object = this._object.transform;
		if (object)
		{
			object.picker = this;
		}
	}
	
    this.lastHitPoint = new THREE.Vector3;
    this.lastHitNormal = new THREE.Vector3;
}

Vizi.Picker.prototype.update = function()
{
}

Vizi.Picker.prototype.onMouseOver = function(event)
{
    this.dispatchEvent("mouseover", event);
    this.dispatchEvent("over", true);
}

Vizi.Picker.prototype.onMouseOut = function(event)
{
    this.dispatchEvent("mouseout", event);
    this.dispatchEvent("over", false);
}
	        	        
Vizi.Picker.prototype.onMouseMove = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject == this)
	{
		this.lastHitPoint.copy(event.point);
		this.lastHitNormal.copy(event.normal);
		this.dispatchEvent("mousemove", event);
	    this.dispatchEvent("hitPoint", event.point);
	    this.dispatchEvent("hitNormal", event.normal);
	}
}

Vizi.Picker.prototype.onMouseDown = function(event)
{
	this.lastHitPoint.copy(event.point);
	this.lastHitNormal.copy(event.normal);
    this.dispatchEvent("mousedown", event);
    this.dispatchEvent("hitPoint", event.point);
    this.dispatchEvent("hitNormal", event.normal);
}

Vizi.Picker.prototype.onMouseUp = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject != this)
	{
		event.point = this.lastHitPoint;
		event.normal = this.lastHitNormal;
	}

	this.dispatchEvent("mouseup", event);
    this.dispatchEvent("hitPoint", event.point);
    this.dispatchEvent("hitNormal", event.normal);
}
	        
Vizi.Picker.prototype.onMouseScroll = function(event)
{
    this.dispatchEvent("mousescroll", event);
}

