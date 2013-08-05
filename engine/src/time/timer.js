/**
 * @fileoverview Timer - component that generates time events
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Timer');
goog.require('Vizi.Component');

Vizi.Timer = function(param)
{
    Vizi.Component.call(this);
    param = param || {};
    
    this.currentTime = Vizi.Time.instance.currentTime;
    this.running = false;
    this.duration = param.duration ? param.duration : 0;
    this.loop = param.loop;
    this.lastFraction = 0;
}

goog.inherits(Vizi.Timer, Vizi.Component);

Vizi.Timer.prototype.update = function()
{
	if (!this.running)
		return;
	
	var now = Vizi.Time.instance.currentTime;
	var deltat = now - this.currentTime;
	
	if (deltat)
	{
	    this.dispatchEvent("time", now);		
	}
	
	if (this.duration)
	{
		var mod = now % this.duration;
		var fract = mod / this.duration;
		
		this.dispatchEvent("fraction", fract);
		
		if (fract < this.lastFraction)
		{
			this.dispatchEvent("cycleTime");
			
			if (!this.loop)
			{
				this.stop();
			}
		}
		
		this.lastFraction = fract;
	}
	
	this.currentTime = now;
	
}

Vizi.Timer.prototype.start = function()
{
	this.running = true;
}

Vizi.Timer.prototype.stop = function()
{
	this.running = false;
}

