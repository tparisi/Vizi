/**
 * @fileoverview MoveBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.MoveBehavior');
goog.require('Vizi.Behavior');

Vizi.MoveBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.moveVector = (param.moveVector !== undefined) ? param.moveVector : new THREE.Vector3(0, 1, 0);
	this.tween = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.MoveBehavior, Vizi.Behavior);

Vizi.MoveBehavior.prototype._componentCategory = "behaviors";

Vizi.MoveBehavior.prototype.start = function()
{
	if (this.running)
		return;
	
	this.movePosition = new THREE.Vector3;
	this.moveEndPosition = this.movePosition.clone().add(this.moveVector);
	this.tween = new TWEEN.Tween(this.movePosition).to(this.moveEndPosition, this.duration * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.MoveBehavior.prototype.evaluate = function(t)
{
	if (t >= this.duration)
	{
		this.stop();
	}
	
	this._object.transform.position.add(this.movePosition);
}


Vizi.MoveBehavior.prototype.stop = function()
{
	if (this.tween)
		this.tween.stop();
	
	Vizi.Behavior.prototype.stop.call(this);
}