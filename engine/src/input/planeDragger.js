/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PlaneDragger');
goog.require('Vizi.Picker');

Vizi.PlaneDragger = function(param) {
	
	param = param || {};
	
    Vizi.Picker.call(this, param);
    
    this.normal = param.normal || new THREE.Vector3(0, 0, 1);
    this.position = param.position || new THREE.Vector3;
    this.color = 0x888888;
}

goog.inherits(Vizi.PlaneDragger, Vizi.Picker);

Vizi.PlaneDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

    // And some helpers
    this.dragObject = null;
	this.dragOffset = new THREE.Vector3;
	this.dragHitPoint = new THREE.Vector3;
	this.dragStartPoint = new THREE.Vector3;
	this.dragPlane = this.createDragPlane();
	this.dragPlane.visible = false;
	this._object._parent.transform.object.add(this.dragPlane);
}

Vizi.PlaneDragger.prototype.createDragPlane = function() {

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
	var planeface = new THREE.Face3( 0, 1, 2 );
	planeface.normal.copy( normal );
	planeface.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
	planegeom.faces.push(planeface);
	var planeface = new THREE.Face3( 0, 2, 3 );
	planeface.normal.copy( normal );
	planeface.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
	planegeom.faces.push(planeface);
	planegeom.computeFaceNormals();
	planegeom.computeCentroids();

	var mat = new THREE.MeshBasicMaterial({color:this.color, transparent: true, side:THREE.DoubleSide, opacity:0.1 });

	var mesh = new THREE.Mesh(planegeom, mat);
	
	return mesh;
}

Vizi.PlaneDragger.prototype.update = function()
{
}

Vizi.PlaneDragger.prototype.onMouseMove = function(event)
{
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragHitPoint.copy(intersection.point).sub(this.dragOffset);
		this.dragHitPoint.add(this.dragStartPoint);
		this.dispatchEvent("drag", {
									type : "drag", 
									object : this.dragObject, 
									offset : this.dragHitPoint
									}
		);
	}
}

Vizi.PlaneDragger.prototype.onMouseDown = function(event)
{
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragOffset.copy(intersection.point); // .sub(this.dragPlane.position);
		this.dragStartPoint.copy(event.object.transform.position);
		this.dragObject = event.object;
	}
}


