/**
 * @fileoverview Contains prefab assemblies for core Vizi package
 * @author Tony Parisi
 */
goog.provide('Vizi.Helpers');

Vizi.Helpers.BoundingBoxDecoration = function(param)
{
	param = param || {};
	if (!param.object) {
		return null;
	}
	
	var object = param.object;
	var color = param.color !== undefined ? param.color : 0x888888;
	
	var bbox = Vizi.SceneUtils.computeBoundingBox(object);
	
	var width = bbox.max.x - bbox.min.x,
		height = bbox.max.y - bbox.min.y,
		depth = bbox.max.z - bbox.min.z;
	
	var mesh = new THREE.BoxHelper();
	mesh.material.color.setHex(color);
	mesh.scale.set(width / 2, height / 2, depth / 2);
	
	var decoration = new Vizi.Decoration({object:mesh});
	
	var center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);
	decoration.position.add(center);
	
	return decoration;
}
