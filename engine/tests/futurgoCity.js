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
	this.vehicleOpen = false;
	this.wheelsMoving = false;
}

FuturgoCity.prototype.go = function() {
	this.viewer = new Vizi.Viewer({ container : this.container, firstPerson:true,
		showGrid:false});
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
	this.scene = data.scene;
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
	
	// Skybox from http://www.3delyvisions.com/
	// http://www.3delyvisions.com/skf1.htm
	var path = "./images/sky35/";
	
	var urls = [ path + "rightcity.jpg", path + "leftcity.jpg",
				 path + "topcity.jpg", path + "botcity.jpg",
				 path + "frontcity.jpg", path + "backcity.jpg" ];

	/*
	var path = "./images/skybox_buildings/";
	
	var urls = [ path + "futurgo_skybox_Right.jpg", path + "futurgo_skybox_Left.jpg",
				 path + "futurgo_skybox_Top.jpg", path + "futurgo_skybox_Bottom",
				 path + "futurgo_skybox_Front.jpg", path + "futurgo_skybox_Back.jpg" ];
	
	
	*/
	
	var envMap = THREE.ImageUtils.loadTextureCube( urls );
	
	scene.map(/Tower.*|Office.*/, function(o) {
		console.log(o.name);

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

	// Maybe fog, need to figure out how to fake it in the background layer
//	Vizi.Graphics.instance.scene.fog = new THREE.FogExp2( 0xaaaabb, .02 );
//	Vizi.Graphics.instance.backgroundLayer.scene.fog = new THREE.FogExp2( 0xaaaabb, 100 );

	/*
	// Ground plane
	var map = THREE.ImageUtils.loadTexture("./models/futurgo_city/images/Road_J04.bmp");
	map.repeat.set(100, 100);
	map.wrapS = map.wrapT = THREE.RepeatWrapping;
	var ground = new Vizi.Object;
	var plane = new Vizi.Visual({
		geometry : new THREE.PlaneGeometry(1000, 1000, 100, 100),
		material : new THREE.MeshBasicMaterial({color:0xffffff,
			map:map}),
	});
	ground.addComponent(plane);
	ground.transform.rotation.x = -Math.PI / 2;
	ground.transform.position.y = -0.5;
	this.viewer.addObject(ground);
	*/
	
	this.viewer.controllerScript.camera.position.set(0, FuturgoCity.AVATAR_HEIGHT, 0);
	this.viewer.controllerScript.camera.near = 0.01;
	
	this.loadFuturgo();
}

FuturgoCity.prototype.onLoadProgress = function(progress)
{
	// Update the laoder bar
	var percentProgress = progress.loaded / progress.total * 100;
	if (this.loadProgressCallback)
		this.loadProgressCallback(percentProgress);
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
	futurgoScene.transform.position.set(5.5, 0, -10);

	// Fade the windows
	futurgoScene.map(/windows_front|windows_rear/, function(o) {
		var fader = new Vizi.FadeBehavior({duration:2, opacity:.8});
		o.addComponent(fader);
		fader.start();
	});

	// Add the pickers
	this.pickers = [];
	var that = this;
	futurgoScene.map("vizi_mobile", function(o) {
		var picker = new Vizi.Picker;
		picker.overCursor = 'pointer';
		picker.addEventListener("mouseover", function(event) { that.onMouseOver("futurgo", event); });
		picker.addEventListener("mouseout", function(event) { that.onMouseOut("futurgo", event); });
		picker.addEventListener("click", function(event) { that.onMouseClick("futurgo", event); });
		o.addComponent(picker);
		that.pickers.push(picker);
	});	

	// The combined lighting from the two scenes/
	// Makes the car look too washed-out.
	// Turn off any lights that came with the car model
	futurgoScene.map(Vizi.PointLight, function(light) {
		light.intensity = 0;
	});

	// Also turn off the ambient light that came with
	// the city model
	this.scene.map(/ambient/, function(o) {
		o.light.color.set(0, 0, 0);
	});

	var futurgo = futurgoScene.findNode("vizi_mobile");
	
	var driveCam = new Vizi.Object;
	var camera = new Vizi.PerspectiveCamera;
	camera.near = 0.01;
	driveCam.addComponent(camera);
	futurgo.addChild(driveCam);
	var scaley = futurgo.transform.scale.y;
	var scalez = futurgo.transform.scale.z;
	var camy = FuturgoCity.AVATAR_HEIGHT_SEATED / scaley;
	var camz = 0.25 / scalez;
	driveCam.transform.position.set(0, camy, camz);
	this.driveCamera = camera;
	
	this.futurgo = futurgo;
	this.vehicleOpen = false;
}

FuturgoCity.prototype.onMouseOver = function(what, event) {
	console.log("Mouse over", what);
	if (this.mouseOverCallback)
		this.mouseOverCallback(what, event);
}

FuturgoCity.prototype.onMouseOut = function(what, event) {
	console.log("Mouse out", what);
	if (this.mouseOutCallback)
		this.mouseOutCallback(what, event);
}

FuturgoCity.prototype.onMouseClick = function(what, event) {

	this.toggleStartStop();

	if (this.mouseClickCallback)
		this.mouseClickCallback(what, event);	
}

FuturgoCity.prototype.toggleStartStop = function(what, event) {

	console.log("Mouse clicked", what);
	this.vehicleOpen = !this.vehicleOpen;
	var that = this;
	if (this.vehicleOpen) {

		// Disable the pickers while inside the car body
		var i, len = that.pickers.length;
		for (i = 0; i < len; i++) {
			that.pickers[i].enabled = false;
		}
		
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
			that.driveCamera.active = true;
		}, 1000);

		setTimeout(function() { 

			that.playCloseAnimations(); 
		}, 2000);

		if (this.startTestDriveCallback)
			this.startTestDriveCallback();

	}
	else {
		// Re-enable the pickers while inside the car body
		var i, len = that.pickers.length;
		for (i = 0; i < len; i++) {
			that.pickers[i].enabled = true;
		}
		
		this.playOpenAnimations();
		
		var that = this;
		setTimeout(function() { 
			
			that.viewer.controllerScript.camera = that.viewer.defaultCamera;
			that.viewer.controllerScript.move = true;
			that.viewer.controllerScript.camera.active = true;

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

FuturgoCity.URL = "./models/futurgo_city/futurgo_city.dae";
FuturgoCity.FuturgoURL = "./models/futurgo_mobile/futurgo_mobile.json";
FuturgoCity.AVATAR_HEIGHT = 2;
FuturgoCity.AVATAR_HEIGHT_SEATED = 1.3;
