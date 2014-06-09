BrushUIPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var i, len = BrushUIScript.urls.length;
	for (i = 0; i < len; i++) {

		var map = new THREE.ImageUtils.loadTexture(BrushUIScript.urls[i]);
		
		var brushUITexture = new THREE.ImageUtils.loadTexture(BrushUIScript.urls[0]);
		var geometry = new THREE.PlaneGeometry(.5, .5);
		var material = new THREE.MeshBasicMaterial({
			map: map,
			transparent:true,
//			opacity:.8,
		});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.visible = (i == 0);
		var visual = new Vizi.Visual({object:mesh});
		obj.addComponent(visual);
		
		var brushUIScript = new BrushUIScript(param);
		obj.addComponent(brushUIScript);
	}	

	obj.transform.position.set(-1, -1.6, 0);
	
	return obj;
}

BrushUIScript = function(param) {
	
	this.visuals = [];
	this.brushIndex = 0;
}

goog.inherits(BrushUIScript, Vizi.Script);

BrushUIScript.prototype.realize = function() {
	
	var visuals = this._object.getComponents(Vizi.Visual);
	var i, len = visuals.length;
	for (i = 0; i < len; i++) {
		this.visuals.push(visuals[i]);
	}
}

BrushUIScript.prototype.update = function() {
}

BrushUIScript.prototype.setBrush = function(index) {
	
	if (index >= this.visuals.length)
		index = this.visuals.length - 1;
	
	if (index < 0)
		return;
	
	var visual = this.visuals[this.brushIndex];
	if (visual) {
		visual.object.visible = false;
	}
	
	visual = this.visuals[index];
	if (visual) {
		visual.object.visible = true;
	}
	
	this.brushIndex = index;
}

BrushUIScript.urls = [
                      "../images/smokeparticlebrush.png",
                      "../images/firebrush.png",
                      "../images/bubblesbrush.png",
                      "../images/fireflybrush.png",
                      ];

BrushUIScript.textures = [
                      ];