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
			var linegeom = new THREE.Geometry();
			linegeom.vertices.push(hitpoint, vec); 

			var mat = new THREE.LineBasicMaterial({color:0xaa0000 });

			var mesh = new THREE.Line(linegeom, mat);
			
			this.normalDecoration = new Vizi.Decoration({object:mesh});
			this.highlightedObject._parent.addComponent(this.normalDecoration);
					
			// The plane
			var planeSize = Math.max(width, Math.max(height, depth));
			var planegeom = new THREE.Geometry();
			var face = event.face;
			var objgeom = object.visuals[0].geometry;
			var v1 = objgeom.vertices[face.a].clone();//.multiplyScalar(planeSize);
			var v2 = objgeom.vertices[face.b].clone();//.multiplyScalar(planeSize);
			var v3 = objgeom.vertices[face.c].clone();//.multiplyScalar(planeSize);
			planegeom.vertices.push(v1, v2, v3); 
			var planeface = new THREE.Face3( 0, 1, 2 );
			planeface.normal.copy( event.normal );
			planeface.vertexNormals.push( event.normal.clone(), event.normal.clone(), event.normal.clone() );
			planegeom.faces.push(planeface);
			planegeom.computeFaceNormals();
			planegeom.computeCentroids();
			//			planegeom = new THREE.PlaneGeometry(planeSize, planeSize);
			
			var mat = new THREE.MeshBasicMaterial({color:0x00aaff, transparent: true, side:THREE.DoubleSide, opacity:0.5 });

			var mesh = new THREE.Mesh(planegeom, mat);
			
			this.planeDecoration = new Vizi.Decoration({object:mesh});
			this.highlightedObject._parent.addComponent(this.planeDecoration);

			var u = new THREE.Vector3(0, event.normal.z, -event.normal.y).normalize().multiplyScalar(Vizi.Editor.DRAG_PLANE_SIZE);
			var v = u.clone().cross(event.normal).multiplyScalar(4);
			
			var cx = event.point.x;
			var cy = event.point.y;
			
			var p1 = event.point.clone().sub(u).sub(v);
			var p2 = event.point.clone().add(u).sub(v);
			var p3 = event.point.clone().add(u).add(v);
			var p4 = event.point.clone().sub(u).add(v);
			
			var planegeom = new THREE.Geometry();
			planegeom.vertices.push(p1, p2, p3, p4); 
			var planeface = new THREE.Face4( 0, 1, 2, 3 );
			planeface.normal.copy( event.normal );
			planeface.vertexNormals.push( event.normal.clone(), event.normal.clone(), event.normal.clone(), event.normal.clone() );
			planegeom.faces.push(planeface);
			planegeom.computeFaceNormals();
			planegeom.computeCentroids();

			var mat = new THREE.MeshBasicMaterial({color:0xaa0000, transparent: true, side:THREE.DoubleSide, opacity:0.1 });

			var mesh = new THREE.Mesh(planegeom, mat);
			
			this.planeDecoration2 = new Vizi.Decoration({object:mesh});
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
	var that = this;
	this.sceneRoot.map(Vizi.Decoration, function(o) {
	});
}

Vizi.Editor.DRAG_PLANE_SIZE = 10;

