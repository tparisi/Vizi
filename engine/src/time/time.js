/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Time');

Vizi.Time = function()
{
	// Freak out if somebody tries to make 2
    if (Vizi.Time.instance)
    {
        throw new Error('Graphics singleton already exists')
    }
}


Vizi.Time.prototype.initialize = function(param)
{
	this.currentTime = Date.now();

	Vizi.Time.instance = this;
}

Vizi.Time.prototype.update = function()
{
	this.currentTime = Date.now();
}

Vizi.Time.instance = null;
	        
