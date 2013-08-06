/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Picker');
goog.require('Vizi.Component');

Vizi.Picker = function(param) {
    Vizi.Component.call(this, param);

    // this.post = true; // these messages get posted to sim queue since they're async, kinda
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
    this.dispatchEvent("mousemove", event);
}

Vizi.Picker.prototype.onMouseDown = function(event)
{
    this.dispatchEvent("mousedown", event);
}

Vizi.Picker.prototype.onMouseUp = function(event)
{
    this.dispatchEvent("mouseup", event);
}
	        
Vizi.Picker.prototype.onMouseScroll = function(event)
{
    this.dispatchEvent("mousescroll", event);
}

