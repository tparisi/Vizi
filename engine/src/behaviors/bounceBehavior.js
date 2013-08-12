/**
 * @fileoverview BounceBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.BounceBehavior');
goog.require('Vizi.Behavior');

Vizi.BounceBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.bounceVector = (param.bounceVector !== undefined) ? param.bounceVector : new THREE.Vector3(0, 1, 0);
	this.tweenUp = null;
	this.tweenDown = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.BounceBehavior, Vizi.Behavior);

Vizi.BounceBehavior.prototype._componentCategory = "behaviors";

Vizi.BounceBehavior.prototype.start = function()
{
	if (this.running)
		return;
	
	this.bouncePosition = this._object.transform.position.clone();
	this.bounceEndPosition = this.bouncePosition.clone().add(this.bounceVector);
	this.tweenUp = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.duration / 2 * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.BounceBehavior.prototype.evaluate = function(t)
{
	this._object.transform.position.copy(this.bouncePosition);
	if (t >= (this.duration / 2))
	{
		if (this.tweenUp)
		{
			this.tweenUp.stop();
			this.tweenUp = null;
		}

		if (!this.tweenDown)
		{
			this.bouncePosition = this._object.transform.position.clone();
			this.bounceEndPosition = this.bouncePosition.clone().sub(this.bounceVector);
			this.tweenDown = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.duration / 2 * 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.repeat(0)
			.start();
		}
	}
	
	if (t >= this.duration)
	{
		this.tweenDown.stop();
		this.tweenDown = null;
		this.stop();
		
		if (!this.once)
			this.start();
	}
}