/**
 *
 */
goog.provide('Vizi.Gamepad');
goog.require('Vizi.EventDispatcher');

Vizi.Gamepad = function()
{
    Vizi.EventDispatcher.call(this);

    // N.B.: freak out if somebody tries to make 2
	// throw (...)

    this.controllers = {
    };
    
	Vizi.Gamepad.instance = this;
}       

Vizi.Gamepad.prototype.update = function() {

	this.scanGamepads();

	for (var c in this.controllers) {
	    var controller = this.controllers[c];
	    for (var i = 0; i < controller.buttons.length; i++) {
	        
	        var val = controller.buttons[i];
	        var pressed = val == 1.0;
	        
	        if (typeof(val) == "object") {
	          pressed = val.pressed;
	          val = val.value;
	        }
	        
	        if (pressed) {
	        	console.log("Pressed: ", i);
	        }
	        else {
	        }
	      }

	    for (var i = 0; i < controller.axes.length; i++) {
	        var val = controller.axes[i];
	        // if (val < 0)
	        //	console.log("Axis: ", i);
	      }
	}
}

Vizi.Gamepad.prototype.addGamepad = function(gamepad) {
	  this.controllers[gamepad.index] = gamepad;
	  console.log("Gamepad added! ", gamepad.id);
}

Vizi.Gamepad.prototype.scanGamepads = function() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in this.controllers)) {
    	  this.addGamepad(gamepads[i]);
      } else {
    	  this.controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
}

Vizi.Gamepad.instance = null;

/* input codes
*/
Vizi.Gamepad.BUTTON_A = Vizi.Gamepad.BUTTON_CROSS 		= 0;
Vizi.Gamepad.BUTTON_B = Vizi.Gamepad.BUTTON_CIRCLE 		= 1;
Vizi.Gamepad.BUTTON_X = Vizi.Gamepad.BUTTON_SQUARE 		= 2;
Vizi.Gamepad.BUTTON_Y = Vizi.Gamepad.BUTTON_TRIANGLE 	= 3;
Vizi.Gamepad.SHOULDER_LEFT 								= 4;
Vizi.Gamepad.SHOULDER_RIGHT 							= 5;
Vizi.Gamepad.TRIGGER_LEFT 								= 6;
Vizi.Gamepad.TRIGGER_RIGHT 								= 7;
Vizi.Gamepad.SELECT = Vizi.Gamepad.BACK 				= 8;
Vizi.Gamepad.START 										= 9;
Vizi.Gamepad.STICK_LEFT 								= 10;
Vizi.Gamepad.STICK_RIGHT 								= 11;
Vizi.Gamepad.DPAD_UP	 								= 12;
Vizi.Gamepad.DPAD_DOWN	 								= 13;
Vizi.Gamepad.DPAD_LEFT	 								= 14;
Vizi.Gamepad.DPAD_RIGHT	 								= 15;
Vizi.Gamepad.HOME = Vizi.Gamepad.MENU					= 16;
