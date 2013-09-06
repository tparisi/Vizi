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
	this.savedColors = [];
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.HighlightBehavior, Vizi.Behavior);

Vizi.HighlightBehavior.prototype.start = function()
{
	Vizi.Behavior.prototype.start.call(this);
	
	if (this._realized && this._object.visuals) {
		var visuals = this._object.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			this.savedColors.push(visuals[i].material.color.getHex());
			visuals[i].material.color.setHex(this.highlightColor);
		}	
	}
}

Vizi.HighlightBehavior.prototype.evaluate = function(t)
{
}

Vizi.HighlightBehavior.prototype.stop = function()
{
	Vizi.Behavior.prototype.stop.call(this);

	if (this._realized && this._object.visuals)
	{
		var visuals = this._object.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			visuals[i].material.color.setHex(this.savedColors[i]);
		}	
	}

}

// Alias a few functions - syntactic sugar
Vizi.HighlightBehavior.prototype.on = Vizi.HighlightBehavior.prototype.start;
Vizi.HighlightBehavior.prototype.off = Vizi.HighlightBehavior.prototype.stop;
