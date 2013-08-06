/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PlaneDragger');
goog.require('Vizi.PlaneDragger');

Vizi.PlaneDragger = function(param) {
    Vizi.Picker.call(this, param);
}

goog.inherits(Vizi.PlaneDragger, Vizi.Picker);

Vizi.PlaneDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);
}

Vizi.PlaneDragger.prototype.update = function()
{
}

Vizi.PlaneDragger.prototype.onMouseMove = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject == this)
	{
		this.dispatchEvent("mousemove", event);
	}
}

Vizi.PlaneDragger.prototype.onMouseDown = function(event)
{
	Vizi.Picker.prototype.onMouseDown.call(this, event);
}

Vizi.PlaneDragger.prototype.onMouseUp = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject == this)
	{
		this.dispatchEvent("mouseup", event);
	}
}
	        
Vizi.PlaneDragger.prototype.onMouseScroll = function(event)
{
    this.dispatchEvent("mousescroll", event);
}

