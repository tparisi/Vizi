/**
 * @fileoverview MoveBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.MoveBehavior');
goog.require('Vizi.Behavior');

Vizi.MoveBehavior = function(param) {
	param = param || {};
	this.bounceTime = (param.bounceTime !== undefined) ? param.bounceTime : 1;
	this.bounceVector = (param.bounceVector !== undefined) ? param.bounceVector : new THREE.Vector3(0, 1, 0);
	this.tweenUp = null;
	this.tweenDown = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.MoveBehavior, Vizi.Behavior);

Vizi.MoveBehavior.prototype._componentCategory = "behaviors";

Vizi.MoveBehavior.prototype.start = function()
{
	if (this.running)
		return;
	
	this.bouncePosition = this._object.transform.position.clone();
	this.bounceEndPosition = this.bouncePosition.clone().add(this.bounceVector);
	this.tweenUp = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.bounceTime / 2 * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.MoveBehavior.prototype.evaluate = function(t)
{
	this._object.transform.position.copy(this.bouncePosition);
	if (t >= (this.bounceTime / 2))
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
			this.tweenDown = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.bounceTime / 2 * 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.repeat(0)
			.start();
		}
	}
	
	if (t >= this.bounceTime)
	{
		this.tweenDown.stop();
		this.tweenDown = null;
		this.stop();
		
		if (!this.once)
			this.start();
	}
}