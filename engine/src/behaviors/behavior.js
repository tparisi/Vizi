/**
 * @fileoverview Behavior component - base class for time-based behaviors
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Behavior');
goog.require('Vizi.Component');

Vizi.Behavior = function(param) {
	param = param || {};
	this.startTime = 0;
	this.running = false;
	this.loop = (param.loop !== undefined) ? param.loop : false;
	this.autoStart = (param.autoStart !== undefined) ? param.autoStart : false;
    Vizi.Component.call(this, param);
}

goog.inherits(Vizi.Behavior, Vizi.Component);

Vizi.Behavior.prototype._componentCategory = "behaviors";

Vizi.Behavior.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	
	if (this.autoStart)
		this.start();
}

Vizi.Behavior.prototype.start = function()
{
	this.startTime = Vizi.Time.instance.currentTime;
	this.running = true;
}

Vizi.Behavior.prototype.stop = function()
{
	this.startTime = 0;
	this.running = false;
}

Vizi.Behavior.prototype.toggle = function()
{
	if (this.running)
		this.stop();
	else
		this.start();
}

Vizi.Behavior.prototype.update = function()
{
	if (this.running)
	{
		// N.B.: soon, add logic to subtract suspend times
		var now = Vizi.Time.instance.currentTime;
		var elapsedTime = (now - this.startTime) / 1000;
		
		this.evaluate(elapsedTime);
	}
}

Vizi.Behavior.prototype.evaluate = function(t)
{
	if (Vizi.Behavior.WARN_ON_ABSTRACT)
		Vizi.System.warn("Abstract Behavior.evaluate called");
}

Vizi.Behavior.WARN_ON_ABSTRACT = true;
