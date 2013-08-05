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
	
	if (this._entity)
	{
		var object = this._entity.transform;
		if (object)
		{
			object.picker = this;
		}
	}
}

Vizi.Picker.prototype.update = function()
{
}

Vizi.Picker.prototype.onMouseOver = function(x, y)
{
    this.publish("mouseOver", x, y);
}

Vizi.Picker.prototype.onMouseOut = function(x, y)
{
    this.publish("mouseOut", x, y);
}
	        	        
Vizi.Picker.prototype.onMouseMove = function(x, y)
{
    this.publish("mouseMove", x, y);
}

Vizi.Picker.prototype.onMouseDown = function(x, y)
{
    this.publish("mouseDown", x, y);
}

Vizi.Picker.prototype.onMouseUp = function(x, y)
{
    this.publish("mouseUp", x, y);
}
	        
Vizi.Picker.prototype.onMouseScroll = function(delta)
{
    this.publish("mouseScroll", delta);
}

