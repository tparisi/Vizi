/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Graphics');

Vizi.Graphics = function()
{
	// Freak out if somebody tries to make 2
    if (Vizi.Graphics.instance)
    {
        throw new Error('Graphics singleton already exists')
    }
	
	Vizi.Graphics.instance = this;
}
	        
Vizi.Graphics.instance = null;
