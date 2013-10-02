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
	this.mouseClickCallback = param.mouseClickCallback;
	this.startTestDriveCallback = param.startTestDriveCallback;
	this.endTestDriveCallback = param.startTestDriveCallback;
	this.part_materials = [];
	this.testDriveRunning = false;
	this.wheelsMoving = false;
}

FuturgoCity.prototype.go = function() {
	this.viewer = new Vizi.Viewer({ container : this.container, firstPerson:true,
		showGrid:false});
	this.loadURL(FuturgoCity.URL);
	this.viewer.mouseDelegate = this;
	this.viewer.keyboardDelegate = this;
	this.viewer.focus();
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
	this.scene = data.scene;
	this.viewer.replaceScene(data);
	
	if (this.loadCallback) {
		var loadTime = (Date.now() - loadStartTime) / 1000;
		this.loadCallback(loadTime);
	}
	
	this.viewer.setController("FPS");
	
	this.addBackground();
	this.addCollisionBox();
	this.fixTrees();
	this.setupCamera();
	this.loadFuturgo();
}

FuturgoCity.prototype.onLoadProgress = function(progress)
{
	// Update the laoder bar
	var percentProgress = progress.loaded / progress.total * 100;
	if (this.loadProgressCallback)
		this.loadProgressCallback(percentProgress);
}

FuturgoCity.prototype.addBackground = function() {
	
	function addEnvMap(material) {
		material.envMap = envMap;
		material.reflectivity = 0.2;
		material.refractionRatio = 0.1;
	}
	
	// Skybox from http://www.3delyvisions.com/
	// http://www.3delyvisions.com/skf1.htm
	var path = "./images/sky35/";
	
	var urls = [ path + "rightcity.jpg", path + "leftcity.jpg",
				 path + "topcity.jpg", path + "botcity.jpg",
				 path + "frontcity.jpg", path + "backcity.jpg" ];

	var envMap = THREE.ImageUtils.loadTextureCube( urls );
	
	this.scene.map(/Tower.*|Office.*/, function(o) {

		var visuals = o.visuals;
		if (visuals) {
			for (var vi = 0; vi < visuals.length; vi++) {
				var v = visuals[vi];
				var material = v.material;
				if (material) {
					if (material instanceof THREE.MeshFaceMaterial) {
						var materials = material.materials;
						var mi, len = materials.length;
						for (mi = 0; mi < len; mi++) {
							addEnvMap(materials[mi]);
						}
					}
					else {
						addEnvMap(material);
					}
				}
			}
		}
	});

	var skybox = Vizi.Prefabs.Skybox(); // {texture:textureCube});
	var skyboxScript = skybox.getComponent(Vizi.SkyboxScript);
	skyboxScript.texture = envMap;
	this.viewer.addObject(skybox);
	
	this.envMap = envMap;

}

FuturgoCity.prototype.addCollisionBox = function() {

	var bbox = Vizi.SceneUtils.computeBoundingBox(this.scene);

	var box = new Vizi.Object;
	box.name = "_futurgoCollisionBox";
	
	var geometry = new THREE.CubeGeometry(bbox.max.x - bbox.min.x,
			bbox.max.y - bbox.min.y,
			bbox.max.z - bbox.min.z);
	
	var material = new THREE.MeshBasicMaterial({
		transparent:true, 
		opacity:0, 
		side:THREE.DoubleSide
		});
	
	var visual = new Vizi.Visual({
		geometry : geometry,
		material : material});
	
	box.addComponent(visual);
	
	this.viewer.addObject(box);
}

FuturgoCity.prototype.fixTrees = function(scene) {
	
	this.scene.map(/^Tree.*/, function(o) {
		
		o.map(Vizi.Visual, function(v){
			var material = v.material;
			if (material instanceof THREE.MeshFaceMaterial) {
				var materials = material.materials;
				var i, len = materials.length;
				for (i = 0; i < len; i++) {
					material = materials[i];
					material.transparent = true;
				}
			}
			else {
				material.transparent = true;
			}
				
		});
	});
}

FuturgoCity.prototype.setupCamera = function() {
	this.viewer.controllerScript.camera.position.set(0, FuturgoCity.AVATAR_HEIGHT, 0);
	this.viewer.controllerScript.camera.near = 0.01;
}


FuturgoCity.prototype.loadFuturgo = function() {
	var that = this;
	
	var loader = new Vizi.Loader;
	loader.addEventListener("loaded", function(data) { that.onFuturgoLoadComplete(data); }); 

	loader.loadScene(FuturgoCity.FuturgoURL);
}

FuturgoCity.prototype.onFuturgoLoadComplete = function(data) {

	// Add the Futurgo to the scene
	this.viewer.addToScene(data);
	var futurgoScene = data.scene;

	// Add some interaction and behaviors
	var that = this;

	// Add environment map and faders to the windows; fade the windows on start
	this.faders = [];
	futurgoScene.map(/windows_front|windows_rear/, function(o) {
		
		var fader = new Vizi.FadeBehavior({duration:2, 
			opacity:FuturgoCity.OPACITY_SEMI_OPAQUE});
		o.addComponent(fader);
		fader.start();
		that.faders.push(fader);

		var visuals = o.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			visuals[i].material.envMap = that.envMap;
			visuals[i].material.reflectivity = 0.1;
			visuals[i].material.refractionRatio = 0.1;
		}
		
	});

	// Add environment map to the body
	futurgoScene.map(/body2/, function(o) {
		var visuals = o.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			visuals[i].material.envMap = that.envMap;
			visuals[i].material.reflectivity = 0.1;
			visuals[i].material.refractionRatio = 0.1;
		}
		
	});
	
	// Add pickers to the vehicle
	this.pickers = [];
	futurgoScene.map("vizi_mobile", function(o) {
		var picker = new Vizi.Picker;
		picker.overCursor = 'pointer';
		picker.addEventListener("mouseover", function(event) { that.onPickerMouseOver("futurgo", event); });
		picker.addEventListener("mouseout", function(event) { that.onPickerMouseOut("futurgo", event); });
		picker.addEventListener("click", function(event) { that.onPickerMouseClick("futurgo", event); });
		o.addComponent(picker);
		that.pickers.push(picker);
	});	

	// The combined lighting from the two scenes
	// makes the car look too washed-out;
	// Turn off any lights that came with the car model
	futurgoScene.map(Vizi.PointLight, function(light) {
		light.intensity = 0;
	});

	// Also turn off the ambient light that came with
	// the city model
	this.scene.map(/ambient/, function(o) {
		o.light.color.set(0, 0, 0);
	});

	// Drop the Futurgo at a good initial position
	var futurgo = futurgoScene.findNode("vizi_mobile");
	futurgo.transform.position.set(5.5, 0, -10);

	// Drop a camera inside the vehicle
	var driveCam = new Vizi.Object;
	var camera = new Vizi.PerspectiveCamera;
	camera.near = 0.01;
	driveCam.addComponent(camera);
	futurgo.addChild(driveCam);	
	// account for scale in model so that
	// we can position the camera properly
	var scaley = futurgo.transform.scale.y;
	var scalez = futurgo.transform.scale.z;
	var camy = FuturgoCity.AVATAR_HEIGHT_SEATED / scaley;
	var camz = 0 / scalez;
	driveCam.transform.position.set(0, camy, camz);
	this.driveCamera = camera;

	// Add the keyboard controller
	this.carController = new FuturgoControllerScript({enabled:false});
	futurgo.addComponent(this.carController);
	
	this.futurgo = futurgo;
	this.futurgoScene = futurgoScene;
	this.testDriveRunning = false;
}

FuturgoCity.prototype.onPickerMouseOver = function(what, event) {

	if (this.mouseOverCallback)
		this.mouseOverCallback(what, event);
}

FuturgoCity.prototype.onPickerMouseOut = function(what, event) {

	if (this.mouseOutCallback)
		this.mouseOutCallback(what, event);
}

FuturgoCity.prototype.onPickerMouseClick = function(what, event) {

	this.toggleStartStop(what);

	if (this.mouseClickCallback)
		this.mouseClickCallback(what, event);	
}

FuturgoCity.prototype.toggleStartStop = function(what, event) {

	this.viewer.focus(); // in case page element had it
	
	this.testDriveRunning = !this.testDriveRunning;
	var that = this;
	if (this.testDriveRunning) {

		// Disable the pickers while inside the car body
		var i, len = that.pickers.length;
		for (i = 0; i < len; i++) {
			that.pickers[i].enabled = false;
		}
		
		this.carController.enabled = true;
		
		this.playOpenAnimations();
		
		/*
		// This should be a move behavior but that requires a Vizi
		// object to move to, not a camera component. Maybe we need
		// to add the viewpoint back to the controller?
		var carpos = this.futurgo.transform.position;

		this.viewer.controllerScript.camera.position.set(0, 0, 0);
		this.viewer.controllerScript.camera._object.transform.position.set(carpos.x, 
				FuturgoCity.AVATAR_HEIGHT_SEATED, carpos.z);
		this.viewer.controllerScript.camera.rotation.set(0, 0, 0);
		*/
		
		var that = this;
		setTimeout(function() { 
			
			that.viewer.controllerScript.camera = that.driveCamera;
			that.viewer.controllerScript.move = false;
			that.driveCamera.rotation.set(0, 0, 0);
			that.driveCamera.active = true;
			
			// Fade the windows
			var i, len = that.faders.length;
			for (i = 0; i < len; i++) {
				var fader = that.faders[i];
				fader.opacity = FuturgoCity.OPACITY_MOSTLY_TRANSPARENT;
				fader.start();
			}
			
		}, 1000);

		setTimeout(function() { 

			that.playCloseAnimations(); 
		}, 2000);

		if (this.startTestDriveCallback)
			this.startTestDriveCallback();

	}
	else {
		// Re-enable the pickers
		var i, len = that.pickers.length;
		for (i = 0; i < len; i++) {
			that.pickers[i].enabled = true;
		}

		// Disable the car controller
		this.carController.enabled = false;
		
		this.playOpenAnimations();
		
		var that = this;
		setTimeout(function() { 
			
			that.viewer.controllerScript.camera = that.viewer.defaultCamera;
			that.viewer.controllerScript.move = true;
			that.viewer.controllerScript.camera.active = true;
			that.viewer.controllerScript.update();
			// Fade the windows
			var i, len = that.faders.length;
			for (i = 0; i < len; i++) {
				var fader = that.faders[i];
				fader.opacity = FuturgoCity.OPACITY_SEMI_OPAQUE;
				fader.start();
			}
//			that.viewer.controllerScript.camera.position.copy(that.futurgo.position);
//			that.viewer.controllerScript.camera.position.x -= 3;
//			that.viewer.controllerScript.camera.position.z += 10;
			
			

		}, 1000);

		setTimeout(function() { 
			
			that.playCloseAnimations(); 
		}, 2000);

		if (this.endTestDriveCallback)
			this.endTestDriveCallback();
	
	}
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

FuturgoCity.prototype.playOpenAnimations = function() {	
	this.playAnimation("animation_window_rear_open");
	this.playAnimation("animation_window_front_open");
}

FuturgoCity.prototype.playCloseAnimations = function() {	
	this.playAnimation("animation_window_rear_open", false, true);
	this.playAnimation("animation_window_front_open", false, true);
}

// Event handling
FuturgoCity.prototype.onMouseDown = function ( event ) {
	this.viewer.focus();
}

FuturgoCity.prototype.onKeyDown = function ( event ) {
	if (this.carController)
		this.carController.onKeyDown(event);
}

FuturgoCity.prototype.onKeyUp = function ( event ) {
	if (this.carController)
		this.carController.onKeyUp(event);
}

FuturgoCity.prototype.onKeyPress = function ( event ) {
	if (this.carController)
		this.carController.onKeyPress(event);
}

FuturgoCity.URL = "./models/futurgo_city/futurgo_city.dae";
FuturgoCity.FuturgoURL = "./models/futurgo_mobile/futurgo_mobile.json";
FuturgoCity.AVATAR_HEIGHT = 2;
FuturgoCity.AVATAR_HEIGHT_SEATED = 1.3;
FuturgoCity.OPACITY_SEMI_OPAQUE = 0.8;
FuturgoCity.OPACITY_MOSTLY_TRANSPARENT = 0.2;
