/**
 * @fileoverview HighlightBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.HighlightBehavior');
goog.require('Vizi.Behavior');

Vizi.HighlightBehavior = function(param) {
	param = param || {};
	this.highlightColor = (param.highlightColor !== undefined) ? param.highlightColor : 0xffffff;
	this.savedColor = 0;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.HighlightBehavior, Vizi.Behavior);

Vizi.HighlightBehavior.prototype.start = function()
{
	Vizi.Behavior.prototype.start.call(this);
	
	if (this._realized && this._object.visual)
	{
		this.savedColor = this._object.visual.material.color.getHex();
		this._object.visual.material.color.setHex(this.highlightColor);
	}
}

Vizi.HighlightBehavior.prototype.evaluate = function(t)
{
}

Vizi.HighlightBehavior.prototype.stop = function()
{
	Vizi.Behavior.prototype.stop.call(this);

	if (this._realized && this._object.visual)
	{
		this._object.visual.material.color.setHex(this.savedColor);
	}

}

// Alias a few functions - syntactic sugar
Vizi.HighlightBehavior.prototype.on = Vizi.HighlightBehavior.prototype.start;
Vizi.HighlightBehavior.prototype.off = Vizi.HighlightBehavior.prototype.stop;
