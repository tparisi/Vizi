/**
 * @fileoverview RotateBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.RotateBehavior');
goog.require('Vizi.Behavior');

Vizi.RotateBehavior = function(param) {
	param = param || {};
	this.velocity = (param.velocity !== undefined) ? param.velocity : Math.PI / 2;
	this.startAngle = 0;
	this.angle = 0;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.RotateBehavior, Vizi.Behavior);

Vizi.RotateBehavior.prototype._componentCategory = "behaviors";

Vizi.RotateBehavior.prototype.start = function()
{
	this.angle = 0;
	this._object.transform.rotation.y = this._object.transform.rotation.y % (Math.PI * 2);
	this.startAngle = this._object.transform.rotation.y;
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.RotateBehavior.prototype.evaluate = function(t)
{
	var twopi = Math.PI * 2;
	this.angle = this.velocity * t;
	if (this.angle >= twopi)
	{
		if (this.once) 
			this.angle = twopi;
		else
			this.angle = this.angle % twopi;
	}
		
	this._object.transform.rotation.y = this.startAngle + this.angle;
	
	if (this.once && this.angle >= twopi)
	{
		this.stop();
	}
}