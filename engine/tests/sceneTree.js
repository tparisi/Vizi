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

sceneNodeInfo = function(viewer, node) {

	var info = {};
	
	if (node.data.vizi) {
		info.object = node.data.vizi.name;
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