/**
 * @fileoverview Editor class - Application Subclass for Model/Scene Editor
 * @author Tony Parisi / http://www.tonyparisi.com
 */

goog.provide('Vizi.Editor');

Vizi.Editor = function(param) {
	// Chain to superclass
	Vizi.Viewer.call(this, param);	
	this.showSelectionBoxes = true;
	this.showNormals = true;
}

goog.inherits(Vizi.Editor, Vizi.Viewer);

Vizi.Editor.prototype.selectObject = function(object, event) {

	if (this.showSelectionBoxes) {
		this.highlightObject(object);
	}
	else {
		this.highlightObject(null);
	}
	
	if (this.showNormals) {
		this.showNormal(object, event);
	}
}

Vizi.Editor.prototype.showNormal = function(object, event) {
	
	if (this.showNormals) {
	}
}

Vizi.Editor.prototype.setSelectionBoxesOn = function(on)
{
	this.showSelectionBoxes = !this.showSelectionBoxes;
	this.highlightObject(null);
}

Vizi.Editor.prototype.setNormalsOn = function(on)
{
	this.showNormals = !this.showNormals;
	var that = this;
	this.sceneRoot.map(Vizi.Decoration, function(o) {
	});
}
