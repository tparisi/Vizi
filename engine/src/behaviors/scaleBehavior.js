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
	this.startScale = (param.startScale !== undefined) ? param.startScale.clone() : 
		new THREE.Vector3(1, 1, 1);
	this.endScale = (param.endScale !== undefined) ? param.endScale.clone() : 
		new THREE.Vector3(2, 2, 2);
	this.tween = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.ScaleBehavior, Vizi.Behavior);

Vizi.ScaleBehavior.prototype.start = function()
{
	if (this.running)
		return;

	this.scale = this.startScale.clone();
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
	
	var sx = this.originalScale.x * this.scale.x;
	var sy = this.originalScale.y * this.scale.y;
	var sz = this.originalScale.z * this.scale.z;
	
	this._object.transform.scale.set(sx, sy, sz);
}


Vizi.ScaleBehavior.prototype.stop = function()
{
	if (this.tween)
		this.tween.stop();
	
	Vizi.Behavior.prototype.stop.call(this);
}