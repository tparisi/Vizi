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
	this.normalDecoration = null;
	this.planeDecoration = null;
	this.planeDecoration2 = null;
	this.selectedObject = null;
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
	
	this.selectedObject = object;
}

Vizi.Editor.prototype.onMouseMove = function(object, event) {

	if (this.selectedObject) {
		this.showNormal(object, event);
	}
}

Vizi.Editor.prototype.showNormal = function(object, event) {
	
	console.log("showNormal: ", event);
	
	if (object === null || event && event.normal && this.showNormals) {
		if (this.highlightedObject) {
			this.highlightedObject._parent.removeComponent(this.normalDecoration);
			this.highlightedObject._parent.removeComponent(this.planeDecoration);
			this.highlightedObject._parent.removeComponent(this.planeDecoration2);
		}
		
		if (object) {
			var bbox = Vizi.SceneUtils.computeBoundingBox(object);

			var width = bbox.max.x - bbox.min.x,
			height = bbox.max.y - bbox.min.y,
			depth = bbox.max.z - bbox.min.z;

			// The normal
			var normalLength = Math.max(width, Math.max(height, depth));
			var hitpoint = event.point.clone();
			var hitnormal = event.normal.clone();
			var vec = hitpoint.clone().add(hitnormal.multiplyScalar(normalLength));
			
			this.normalDecoration = Vizi.Helpers.VectorDecoration({
				start : hitpoint,
				end : vec,
				color : 0xaa0000
			});
						
			this.highlightedObject._parent.addComponent(this.normalDecoration);
					
			// The plane
			var planeSize = Math.max(width, Math.max(height, depth));

			this.planeDecoration2 = Vizi.Helpers.PlaneDecoration({
				normal: event.normal,
				position:event.point,
				size:planeSize});
			this.highlightedObject._parent.addComponent(this.planeDecoration2);
		
		}

	}
}

Vizi.Editor.prototype.highlightObject = function(object) {

	if (object === null) {
		this.showNormal(object, null);
	}
	
	Vizi.Viewer.prototype.highlightObject.call(this, object);
}


Vizi.Editor.prototype.setSelectionBoxesOn = function(on)
{
	this.showSelectionBoxes = !this.showSelectionBoxes;
	this.highlightObject(null);
}

Vizi.Editor.prototype.setNormalsOn = function(on)
{
	this.showNormals = !this.showNormals;
	this.showNormal(null, null);
	
}

Vizi.Editor.DRAG_PLANE_SIZE = 10;

