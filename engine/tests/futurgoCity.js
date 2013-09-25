/**
 * @fileoverview Futurgo Example - 3D Product Page
 * @author Tony Parisi
 */

FuturgoCity = function(param) {

	this.container = param.container;
	this.loadCallback = param.loadCallback;
	this.loadProgressCallback = param.loadProgressCallback;
	this.mouseOverCallback = param.mouseOverCallback;
	this.mouseOutCallback = param.mouseOutCallback;
	this.part_materials = [];
	this.vehicleOpen = false;
	this.wheelsMoving = false;
}

FuturgoCity.prototype.go = function() {
	this.viewer = new Vizi.Viewer({ container : this.container, showGrid : false,
		allowPan: false, oneButton: true });
	this.loadURL(FuturgoCity.URL);
	this.viewer.run();
	
}

FuturgoCity.prototype.loadURL = function(url) {

	var that = this;
	
	var loader = new Vizi.Loader;
	loader.addEventListener("loaded", function(data) { that.onLoadComplete(data, loadStartTime); }); 
	loader.addEventListener("progress", function(progress) { that.onLoadProgress(progress); }); 

	var loadStartTime = Date.now();
	loader.loadScene(url);	
}

FuturgoCity.prototype.onLoadComplete = function(data, loadStartTime)
{
	var scene = data.scene;
	this.viewer.replaceScene(data);
	
	if (this.loadCallback) {
		var loadTime = (Date.now() - loadStartTime) / 1000;
		this.loadCallback(loadTime);
	}
	
	this.viewer.setController("FPS");
	
	this.addEnvironment(data.scene);
}

FuturgoCity.prototype.addEnvironment = function(scene) {
	
	function addEnvMap(material) {
		material.envMap = envMap;
		material.reflectivity = 0.2;
		material.refractionRatio = 0.1;
	}
	
	var path = "./images/skybox_breakdown/";

	var urls = [ path + "posx.jpg", path + "negx.jpg",
				 path + "posy.jpg", path + "negy.jpg",
				 path + "posz.jpg", path + "negz.jpg" ];

	/*
	var path = "./images/skybox/";

	var urls = [ path + "px.jpg", path + "nx.jpg",
				 path + "py.jpg", path + "ny.jpg",
				 path + "pz.jpg", path + "nz.jpg" ];

	*/
	
	var envMap = THREE.ImageUtils.loadTextureCube( urls );
	
	scene.map(/Tower.*|Office.*/, function(o) {
		console.log(o.name);

		o.map(Vizi.Visual, function(v) {
			var material = v.material;
			if (material) {
				if (material instanceof THREE.MeshFaceMaterial) {
					var materials = material.materials;
					var i, len = materials.length;
					for (i = 0; i < len; i++) {
						addEnvMap(materials[i]);
					}
				}
				else {
					addEnvMap(material);
				}
			}
		});
	
	});

}

FuturgoCity.prototype.onLoadProgress = function(progress)
{
	// Update the laoder bar
	var percentProgress = progress.loaded / progress.total * 100;
	if (this.loadProgressCallback)
		this.loadProgressCallback(percentProgress);
}

FuturgoCity.prototype.useCamera = function(name) {
	this.viewer.useCamera(name);
}

FuturgoCity.prototype.playAnimation = function(name, loop, reverse) {
	var animationNames = this.viewer.keyFrameAnimatorNames;
	var index = animationNames.indexOf(name);
	if (index >= 0)
	{
		this.viewer.playAnimation(index, loop, reverse);
	}
}

FuturgoCity.prototype.stopAnimation = function(name) {
	var animationNames = this.viewer.keyFrameAnimatorNames;
	var index = animationNames.indexOf(name);
	if (index >= 0)
	{
		this.viewer.stopAnimation(index);
	}
}

FuturgoCity.URL = "./models/futurgo_city/futurgo_city.dae";