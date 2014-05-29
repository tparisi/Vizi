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
    
    this.values = {
    };
    
	Vizi.Gamepad.instance = this;
}       

goog.inherits(Vizi.Gamepad, Vizi.EventDispatcher);

Vizi.Gamepad.prototype.update = function() {

	this.scanGamepads();

	var buttonsChangedEvent = {
			changedButtons: [],
	};

	var axesChangedEvent = {
			changedAxes: [],
	};
	
	for (var c in this.controllers) {
	    var controller = this.controllers[c];
	    this.testValues(controller, buttonsChangedEvent, axesChangedEvent);
	    this.saveValues(controller);
	}
	
	if (buttonsChangedEvent.changedButtons.length) {
		this.dispatchEvent("buttonsChanged", buttonsChangedEvent);
	}

	if (axesChangedEvent.changedAxes.length) {
		this.dispatchEvent("axesChanged", axesChangedEvent);
	}
}

Vizi.Gamepad.prototype.testValues = function(gamepad, buttonsChangedEvent, axesChangedEvent) {
	var values = this.values[gamepad.index];
	if (values) {
	    for (var i = 0; i < gamepad.buttons.length; i++) {
	        
	        var val = gamepad.buttons[i];
	        var pressed = val == 1.0;
	        
	        if (typeof(val) == "object") {
	          pressed = val.pressed;
	          val = val.value;
	        }

	        if (pressed != values.buttons[i]) {
	        	console.log("Pressed: ", i);
	        	buttonsChangedEvent.changedButtons.push({
	        		gamepad : gamepad.index,
	        		button : i,
	        		pressed : pressed,
	        	});
	        }	        	
	      }

	    for (var i = 0; i < gamepad.axes.length; i++) {
	        var val = gamepad.axes[i];
	        if (val != values.axes[i]) {
	        	console.log("Axis: ", i, val);
	        	axesChangedEvent.changedAxes.push({
	        		gamepad : gamepad.index,
	        		axis : i,
	        		value : val,
	        	});
	        }
	      }		
	}
}

Vizi.Gamepad.prototype.saveValues = function(gamepad) {
	var values = this.values[gamepad.index];
	if (values) {
	    for (var i = 0; i < gamepad.buttons.length; i++) {
	        
	        var val = gamepad.buttons[i];
	        var pressed = val == 1.0;
	        
	        if (typeof(val) == "object") {
	          pressed = val.pressed;
	          val = val.value;
	        }

	        values.buttons[i] = pressed;
	      }

	    for (var i = 0; i < gamepad.axes.length; i++) {
	        var val = gamepad.axes[i];
	        values.axes[i] = val;
	      }		
	}
}

Vizi.Gamepad.prototype.addGamepad = function(gamepad) {
	  this.controllers[gamepad.index] = gamepad;
	  this.values[gamepad.index] = {
			  buttons : [],
			  axes : [],
	  };
	  
	  this.saveValues(gamepad);
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
