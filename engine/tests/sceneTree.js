/**
 * @fileoverview Scene Tree Display - Uses Dynatree to Display Vizi Scene Tree
 * @author Tony Parisi
 */

buildSceneTree = function(scene, tree) {
	
	function build(object, node, level) {

		var noname = level ? "[object]" : "Scene";
		
		var childNode = node.addChild({
			title: object.name ? object.name : noname,
			expand: true,
			tooltip: "object",
			isFolder: false,
			vizi:object,
		});
		
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

selectSceneNode = function(viewer, node) {
	
	if (node.data.vizi) {
//		alert("Node " + node.data.vizi.name + " selected.");
		
		setTimeout(function() {
			viewer.highlightObject(node.data.vizi);
		}, 10);
	}
	
}