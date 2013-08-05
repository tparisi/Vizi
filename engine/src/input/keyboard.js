/**
 *
 */
goog.provide('Vizi.Keyboard');

Vizi.Keyboard = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	Vizi.Keyboard.instance = this;
}

Vizi.Keyboard.prototype.onKeyDown = function(keyCode, charCode)
{
}

Vizi.Keyboard.prototype.onKeyUp = function(keyCode, charCode)
{
}

Vizi.Keyboard.prototype.onKeyPress = function(keyCode, charCode)
{
}	        

Vizi.Keyboard.instance = null;

/* key codes
37: left
38: up
39: right
40: down
*/
Vizi.Keyboard.KEY_LEFT  = 37;
Vizi.Keyboard.KEY_UP  = 38;
Vizi.Keyboard.KEY_RIGHT  = 39;
Vizi.Keyboard.KEY_DOWN  = 40;
