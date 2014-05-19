/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.CylinderDragger');
goog.require('Vizi.Picker');

Vizi.CylinderDragger = function(param) {
	
	param = param || {};
	
    Vizi.Picker.call(this, param);
    
    this.normal = param.normal || new THREE.Vector3(0, 1, 0);
    this.position = param.position || new THREE.Vector3;
    this.color = 0xaa0000;
}

goog.inherits(Vizi.CylinderDragger, Vizi.Picker);

Vizi.CylinderDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

    // And some helpers
    this.dragObject = null;
	this.dragOffset = new THREE.Euler;
	this.currentOffset = new THREE.Euler;
	this.dragHitPoint = new THREE.Vector3;
	this.dragStartPoint = new THREE.Vector3;
	this.dragPlane = this.createDragPlane();
	this.dragPlane.visible = Vizi.CylinderDragger.SHOW_DRAG_PLANE;
	this.dragPlane.ignorePick = true;
	this._object.transform.object.add(this.dragPlane);
}

Vizi.CylinderDragger.prototype.createDragPlane = function() {

	var size = 2000;
	var normal = this.normal;
	var position = this.position;
	
	var u = new THREE.Vector3(0, normal.z, -normal.y).normalize().multiplyScalar(size);
	if (!u.lengthSq())
		u = new THREE.Vector3(-normal.z, normal.x, 0).normalize().multiplyScalar(size);

	var v = u.clone().cross(normal).normalize().multiplyScalar(size);
	
	var p1 = position.clone().sub(u).sub(v);
	var p2 = position.clone().add(u).sub(v);
	var p3 = position.clone().add(u).add(v);
	var p4 = position.clone().sub(u).add(v);
	
	var planegeom = new THREE.Geometry();
	planegeom.vertices.push(p1, p2, p3, p4); 
	var planeface = new THREE.Face3( 0, 2, 1 );
	planeface.normal.copy( normal );
	planeface.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
	planegeom.faces.push(planeface);
	var planeface = new THREE.Face3( 0, 3, 2 );
	planeface.normal.copy( normal );
	planeface.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
	planegeom.faces.push(planeface);
	planegeom.computeFaceNormals();
	planegeom.computeCentroids();

	var mat = new THREE.MeshBasicMaterial({color:this.color, transparent: true, side:THREE.DoubleSide, opacity:0.1 });

	var mesh = new THREE.Mesh(planegeom, mat);
	
	return mesh;
}

Vizi.CylinderDragger.prototype.update = function()
{
}

Vizi.CylinderDragger.prototype.onMouseDown = function(event) {
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	this.handleMouseDown(event);
}

Vizi.CylinderDragger.prototype.handleMouseDown = function(event) {
	
	if (this.dragPlane) {
		
		var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
		
		if (intersection)
		{			
//			this.toModelSpace(intersection.point);
			this.dragStartPoint.copy(intersection.point).normalize();
//			this.dragOffset.copy(this._object.transform.rotation);
			this.dragObject = event.object;
		    this.dispatchEvent("dragstart", {
		        type : "dragstart",
		        offset : intersection.point
		    });
		    
		}
	    
	}
	
	if (Vizi.CylinderDragger.SHOW_DRAG_NORMAL) {
		
		if (this.arrowDecoration)
			this._object.removeComponent(this.arrowDecoration);
		
		var mesh = new THREE.ArrowHelper(this.normal, new THREE.Vector3, 500, 0x00ff00, 5, 5);
		var visual = new Vizi.Decoration({object:mesh});
		this._object.addComponent(visual);
		this.arrowDecoration = visual;
		
	}
}

Vizi.CylinderDragger.prototype.onMouseMove = function(event) {
	Vizi.Picker.prototype.onMouseMove.call(this, event);
	this.handleMouseMove(event);
}

Vizi.CylinderDragger.prototype.handleMouseMove = function(event) {
	
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
//		this.toModelSpace(intersection.point);
		var projectedPoint = intersection.point.clone().normalize();
		var theta = Math.acos(projectedPoint.dot(this.dragStartPoint));
		var cross = projectedPoint.clone().cross(this.dragStartPoint);
		if (this.normal.dot(cross) > 0)
			theta = -theta;
		
		this.currentOffset.set(this.dragOffset.x + this.normal.x * theta, 
				this.dragOffset.y + this.normal.y * theta,
				this.dragOffset.z + this.normal.z * theta);
			
		this.dispatchEvent("drag", {
				type : "drag", 
				offset : this.currentOffset,
			}
		);
	}
}

Vizi.CylinderDragger.prototype.onMouseUp = function(event) {
	Vizi.Picker.prototype.onMouseUp.call(this, event);
	this.handleMouseUp(event);
}

Vizi.CylinderDragger.prototype.handleMouseUp = function(event) {
	
	if (this.arrowDecoration)
		this._object.removeComponent(this.arrowDecoration);

}

Vizi.CylinderDragger.prototype.onTouchStart = function(event) {
	Vizi.Picker.prototype.onTouchStart.call(this, event);

	this.handleMouseDown(event);
}

Vizi.CylinderDragger.prototype.onTouchMove = function(event) {
	Vizi.Picker.prototype.onTouchMove.call(this, event);

	this.handleMouseMove(event);
}

Vizi.CylinderDragger.prototype.onTouchEnd = function(event) {
	Vizi.Picker.prototype.onTouchEnd.call(this, event);

	this.handleMouseUp(event);
}

Vizi.CylinderDragger.SHOW_DRAG_PLANE = false;
Vizi.CylinderDragger.SHOW_DRAG_NORMAL = false;
