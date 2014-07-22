/**
 * @fileoverview General-purpose transitions
 * @author Tony Parisi
 */
goog.provide('Vizi.Transition');
goog.require('Vizi.Component');

// Transition class
// Construction/initialization
Vizi.Transition = function(param) 
{
    Vizi.Component.call(this, param);
	    		
	param = param || {};
	
	this.running = false;
	this.duration = param.duration ? param.duration : Vizi.Transition.default_duration;
	this.loop = param.loop ? param.loop : false;
	this.autoStart = param.autoStart || false;
	this.easing = param.easing || Vizi.Transition.default_easing;
	this.target = param.target;
	this.to = param.to;
}

goog.inherits(Vizi.Transition, Vizi.Component);
	
Vizi.Transition.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	this.createTweens();
	if (this.autoStart) {
		this.start();
	}
}

Vizi.Transition.prototype.createTweens = function()
{
	var repeatCount = this.loop ? Infinity : 0;
	
	var that = this;
	this.tween = new TWEEN.Tween(this.target)
		.to(this.to, this.duration)
		.easing(this.easing)
		.repeat(repeatCount)
		.onComplete(function() {
			that.onTweenComplete();
		})
		;
}

// Start/stop
Vizi.Transition.prototype.start = function()
{
	if (this.running)
		return;
	
	this.running = true;
	
	this.tween.start();
}

Vizi.Transition.prototype.stop = function()
{
	if (!this.running)
		return;
	
	this.running = false;
	this.dispatchEvent("complete");

	this.tween.stop();
}

Vizi.Transition.prototype.onTweenComplete = function()
{
	this.running = false;
	this.dispatchEvent("complete");
}
// Statics
Vizi.Transition.default_duration = 1000;
Vizi.Transition.default_easing = TWEEN.Easing.Linear.None;