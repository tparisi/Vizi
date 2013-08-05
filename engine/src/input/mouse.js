/**
 *
 */
goog.provide('Vizi.Mouse');

Vizi.Mouse = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	this.state = 
	{ x : Vizi.Mouse.NO_POSITION, y: Vizi.Mouse.NO_POSITION,

	buttons : { left : false, middle : false, right : false },
	scroll : 0,
	};

	Vizi.Mouse.instance = this;
};

Vizi.Mouse.prototype.onMouseMove = function(x, y)
{
    this.state.x = x;
    this.state.y = y;	            
}

Vizi.Mouse.prototype.onMouseDown = function(x, y)
{
    this.state.x = x;
    this.state.y = y;
    this.state.buttons.left = true;
}

Vizi.Mouse.prototype.onMouseUp = function(x, y)
{
    this.state.x = x;
    this.state.y = y;
    this.state.buttons.left = false;	            
}

Vizi.Mouse.prototype.onMouseScroll = function(event, delta)
{
    this.state.scroll = 0; // PUNT!
}


Vizi.Mouse.prototype.getState = function()
{
	return this.state;
}

Vizi.Mouse.instance = null;
Vizi.Mouse.NO_POSITION = Number.MIN_VALUE;
