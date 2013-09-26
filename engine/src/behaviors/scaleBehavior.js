/**
 * @fileoverview ScaleBehavior - simple scale up/down over time
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.ScaleBehavior');
goog.require('Vizi.Behavior');

Vizi.ScaleBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.startScale = { scale : (param.startScale !== undefined) ? param.startScale : 1 };
	this.endScale = { scale : (param.endScale !== undefined) ? param.endScale : 2 };
	this.tween = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.ScaleBehavior, Vizi.Behavior);

Vizi.ScaleBehavior.prototype.start = function()
{
	if (this.running)
		return;

	this.scale = { scale : this.startScale.scale };
	this.originalScale = this._object.transform.scale.clone();
	this.tween = new TWEEN.Tween(this.scale).to(this.endScale, this.duration * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.ScaleBehavior.prototype.evaluate = function(t)
{
	if (t >= this.duration)
	{
		this.stop();
		if (this.loop) {
			this.start();
		}
		else {
			this.dispatchEvent("complete");
		}
	}
	
	this._object.transform.scale.copy(this.originalScale.clone().multiplyScalar(this.scale.scale));
}


Vizi.ScaleBehavior.prototype.stop = function()
{
	if (this.tween)
		this.tween.stop();
	
	Vizi.Behavior.prototype.stop.call(this);
}