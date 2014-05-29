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
	this.gamepad = new Vizi.Gamepad();
	Vizi.Input.instance = this;
}

goog.inherits(Vizi.Input, Vizi.Service);

Vizi.Input.prototype.update = function() {
	if (this.gamepad && this.gamepad.update)
		this.gamepad.update();
}

Vizi.Input.instance = null;