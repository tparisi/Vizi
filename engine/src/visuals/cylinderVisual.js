/**
 * @fileoverview A visual containing a cylinder mesh.
 * @author Tony Parisi
 */
goog.provide('Vizi.CylinderVisual');
goog.require('Vizi.Visual');

/**
 * @param {Object} param supports the following options:
 *   radiusTop (number): The top radius of the cylinder
 *   radiusBottom (number): The bottom radius of the cylinder
 *   height (number): The height of the cylinder
 *   segmentsRadius (number): The radius of the segments
 *   segmentsHeight (number): The height of the segments
 *   openEnded (boolean): Whether the cylinder is open ended
 * @constructor
 * @extends {Vizi.Visual}
 */
Vizi.CylinderVisual = function(param) {
    Vizi.Visual.call(this, param);

    this.param = param || {};
}

goog.inherits(Vizi.CylinderVisual, Vizi.Visual);

Vizi.CylinderVisual.prototype.realize = function()
{
	Vizi.Visual.prototype.realize.call(this);
	
    var radiusTop = this.param.radiusTop || 1.0;
    var radiusBottom = this.param.radiusBottom || 1.0;
    var height = this.param.height || 1.0;
    var segmentsRadius = this.param.segmentsRadius || 100;
    var segmentsHeight = this.param.segmentsHeight || 100;
    var openEnded = this.param.openEnded || false;
    var color = this.param.color || 0xFFFFFF;
    var ambient = this.param.ambient || 0;
    
	var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segmentsRadius, segmentsHeight, openEnded);
	this.object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color : color }));
	
    this.addToScene();
}
