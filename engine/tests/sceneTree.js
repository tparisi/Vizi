/**
 * @fileoverview Scene Tree Display - Uses Dynatree to Display Vizi Scene Tree
 * @author Tony Parisi
 */

sceneTreeMap = {};

buildSceneTree = function(scene, tree) {
	
	function build(object, node, level) {
		
		var noname = level ? "[object]" : "Scene";
		
		var childNode = node.addChild({
			title: object.name ? object.name : noname,
			expand: level <= 1,
			activeVisible:true,
			tooltip: "object",
			isFolder: false,
			vizi:object,
		});

		sceneTreeMap[object._id] = childNode;
		
		var i, len = object._children.length;
		for (i = 0; i < len; i++) {	
			build(object._children[i], childNode, level+1);
		}
	}
	
	build(scene, tree, 0);
	
	
	//return map;
	
	// tree.childList[0].activate();
	/*
	var childNode = rootNode.addChild({
		title: "Programatically addded nodes",
		tooltip: "This folder and all child nodes were added programmatically.",
		isFolder: false,
	});
	childNode.addChild({
		title: "Document using a custom icon",
	});
	*/
}

var selectedSceneNode = null;

selectSceneNode = function(viewer, node) {
	
	if (selectedSceneNode) {
//		selectedSceneNode.activate(false);
//		selectedSceneNode.select(false);
	}
	
	if (node.data.vizi) {
//		alert("Node " + node.data.vizi.name + " selected.");
		
		setTimeout(function() {
			viewer.highlightObject(node.data.vizi);
		}, 10);
	}
	
	selectedSceneNode = node;
	
}

vec3toString = function(vec) {
	return "[" + vec.x.toFixed(6) + "," + vec.y.toFixed(6) + "," + vec.z.toFixed(6) + "]";
}

transformToString = function(transform) {

	var str = "<b>Transform</b><br>pos: " + vec3toString(transform.position) +
		"<br>rot:" + vec3toString(transform.position) +
		"<br>scl:" + vec3toString(transform.scale);		
	
	return str;
}

meshToString = function(mesh) {
	return "(tbd)";

}

materialToString = function(material) {
	return "(tbd)";
}

visualToString = function(visual) {

	if (!visual)
		return "<b>Visual</b>(null)";
	
	var str = "<b>Visual</b><br>mesh: " + meshToString(visual.mesh) +
		"<br>material:" + materialToString(visual.material);

	return str;
}

lightToString = function(light) {

	var str = "<b>Light</b>";		
	
	return str;
}

cameraToString = function(camera) {

	var str = "<b>Camera</b>";		
	
	return str;
}


sceneNodeInfo = function(viewer, node) {

	var info = {};
	
	if (node.data.vizi) {
		var object = node.data.vizi;
		var transform = transformToString(object.transform);
		var visual = visualToString(object.visuals && object.visuals.length ? object.visuals[0] : null);
		var light = lightToString(object.light);
		var camera = cameraToString(object.camera);
		info.object = {
				name : object.name,
				id : object._id,
				components : {
					transform : transform,
					visual : visual,
					light : light,
					camera : camera,
				}
		};
		
		info.text = info.object.name + "<br>" + info.object.id + "<br>" + info.object.components.transform;
	}

	return info;
}

selectSceneNodeFromId = function(viewer, id) {
	
	if (selectedSceneNode) {
//		selectedSceneNode.activate(false);
//		selectedSceneNode.select(false);
	}
	
	var node = sceneTreeMap[id];
	
	if (node) {
		node.focus();
		node.activate(true);
		node.select(true);
		selectedSceneNode = node;
	}
	
}