/**
 *
 */
goog.provide('Vizi.Input');
goog.require('Vizi.Service');
goog.require('Vizi.Mouse');
goog.require('Vizi.Keyboard');

Vizi.Input = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	this.mouse = new Vizi.Mouse();
	this.keyboard = new Vizi.Keyboard();
	Vizi.Input.instance = this;
}

goog.inherits(Vizi.Input, Vizi.Service);

Vizi.Input.instance = null;