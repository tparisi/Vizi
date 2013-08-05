/**
 * @fileoverview The base Application class
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Application');
goog.require('Vizi.EventDispatcher');
goog.require('Vizi.Time');
goog.require('Vizi.Input');
goog.require('Vizi.Services');

/**
 * @constructor
 */
Vizi.Application = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	Vizi.EventDispatcher.call(this);
	Vizi.Application.instance = this;
}

goog.inherits(Vizi.Application, Vizi.EventDispatcher);

Vizi.Application.prototype.initialize = function(param)
{
	param = param || {};

	this.tabstop = param.tabstop;
	
	this._services = [];
	this._objects = [];

	// Add required services first
	this.addService("time");
	this.addService("input");
	
	// Add optional (game-defined) services next
	this.addOptionalServices();

	// Add events and rendering services last - got to;
	this.addService("events");
	this.addService("graphics");
	
	// Start all the services
	this.initServices(param);
}

Vizi.Application.prototype.addService = function(serviceName)
{
	var service = Vizi.Services.create(serviceName);
	this._services.push(service);	
}

Vizi.Application.prototype.initServices = function(param)
{
	var i, len;
	len = this._services.length;
	for (i = 0; i < len; i++)
	{
		this._services[i].initialize(param);
	}
}

Vizi.Application.prototype.addOptionalServices = function()
{
}

Vizi.Application.prototype.focus = function()
{
	// Hack hack hack should be the input system
	Vizi.Graphics.instance.focus();
}

Vizi.Application.prototype.run = function()
{
    // core game loop here	        	
	// this.graphics.run();
	this.lastFrameTime = Date.now();
	this.runloop();
}
	        
Vizi.Application.prototype.runloop = function()
{
	var now = Date.now();
	var deltat = now - this.lastFrameTime;
	
	if (deltat >= Vizi.Application.minFrameTime)
	{
		this.updateServices();
        this.lastFrameTime = now;
	}
	
	var that = this;
    requestAnimationFrame( function() { that.runloop(); } );
}

Vizi.Application.prototype.updateServices = function()
{
	var i, len;
	len = this._services.length;
	for (i = 0; i < len; i++)
	{
		this._services[i].update();
	}
}

Vizi.Application.prototype.updateObjects = function()
{
	var i, len = this._objects.length;
	
	for (i = 0; i < len; i++)
	{
		this._objects[i].update();
	}
	
}

Vizi.Application.prototype.addObject = function(e)
{
	this._objects.push(e);
}

Vizi.Application.prototype.removeObject = function(e) {
    var i = this._objects.indexOf(e);
    if (i != -1) {
    	// N.B.: I suppose we could be paranoid and check to see if I actually own this component
        this._objects.splice(i, 1);
    }
}
	
Vizi.Application.prototype.onMouseMove = function(x, y)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseMove(x, y);
	}
}

Vizi.Application.prototype.onMouseDown = function(x, y)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseDown(x, y);
	}
}

Vizi.Application.prototype.onMouseUp = function(x, y)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseUp(x, y);
	}
}

Vizi.Application.prototype.onMouseScroll = function(delta)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseScroll(delta);
	}
}

Vizi.Application.prototype.onKeyDown = function(keyCode, charCode)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyDown(keyCode, charCode);
	}
}

Vizi.Application.prototype.onKeyUp = function(keyCode, charCode)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyUp(keyCode, charCode);
	}
}

Vizi.Application.prototype.onKeyPress = function(keyCode, charCode)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyPress(keyCode, charCode);
	}
}	

/* statics */

Vizi.Application.instance = null;
Vizi.Application.curObjectID = 0;
Vizi.Application.minFrameTime = 1;
	    	
Vizi.Application.handleMouseMove = function(pageX, pageY, eltX, eltY)
{
//    if (Vizi.Picker.clickedObject)
//   	return;
    
    if (Vizi.Application.instance.onMouseMove)
    	Vizi.Application.instance.onMouseMove(pageX, pageY, eltX, eltY);	            	
}

Vizi.Application.handleMouseDown = function(pageX, pageY, eltX, eltY)
{
    // N.B.: ahh, the bullshit continues...
    if (Vizi.Application.instance.tabstop)
    	Vizi.Application.instance.focus();
    
    // console.log("Mouse down " + event.pageX + ", " + event.pageY);
    
    if (Vizi.Picker.clickedObject)
    	return;
    
    if (Vizi.Application.instance.onMouseDown)
    	Vizi.Application.instance.onMouseDown(pageX, pageY, eltX, eltY);	            	
}

Vizi.Application.handleMouseUp = function(pageX, pageY, eltX, eltY)
{
    if (Vizi.Picker.clickedObject)
    	return;
    
    if (Vizi.Application.instance.onMouseUp)
    	Vizi.Application.instance.onMouseUp(pageX, pageY, eltX, eltY);	            	
}

Vizi.Application.handleMouseScroll = function(delta)
{
    if (Vizi.Picker.overObject)
    	return;
    
    if (Vizi.Application.instance.onMouseScroll)
    	Vizi.Application.instance.onMouseScroll(delta);	            	
}

Vizi.Application.handleKeyDown = function(keyCode, charCode)
{
    if (Vizi.Application.instance.onKeyDown)
    	Vizi.Application.instance.onKeyDown(keyCode, charCode);	            	
}

Vizi.Application.handleKeyUp = function(keyCode, charCode)
{
    if (Vizi.Application.instance.onKeyUp)
    	Vizi.Application.instance.onKeyUp(keyCode, charCode);	            	
}

Vizi.Application.handleKeyPress = function(keyCode, charCode)
{
    if (Vizi.Application.instance.onKeyPress)
    	Vizi.Application.instance.onKeyPress(keyCode, charCode);	            	
}	        
