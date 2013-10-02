/*
 * dashboard script for futurgo vehicle
 * extends Vizi.Script
 */

FuturgoDashboardScript = function(param)
{
	param = param || {};
	
	Vizi.Script.call(this, param);

	this.enabled = (param.enabled !== undefined) ? param.enabled : true;	
}

goog.inherits(FuturgoDashboardScript, Vizi.Script);

FuturgoDashboardScript.prototype.realize = function()
{
	// Set up the guages
	var guage = this._object.findNode("head_light_L1");
	var visual = guage.visuals[0];
	this.texture = visual.material.map;
}

FuturgoDashboardScript.prototype.update = function()
{
	if (!this.enabled)
		return;

	this.texture.offset.x += 0.01;
	this.texture.needsUpdate = true;
}




