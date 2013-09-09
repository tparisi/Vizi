/**
 * @fileoverview General-purpose key frame animation
 * @author Tony Parisi
 */

futurgo = function(param) {

	this.container = param.container;
	this.loadStatus = param.loadStatus;
	this.overlay = param.overlay;
	this.overlayContents = param.overlayContents;
	this.rolloverCallback = param.rolloverCallback;
	this.part_materials = [];
	this.vehicleOpen = false;
	this.wheelsMoving = false;
}

futurgo.prototype.go = function() {
	this.viewer = new SceneViewer({ container : this.container, showGrid : true });
	this.loadURL(futurgo.URL);
	this.viewer.run();
}

futurgo.prototype.openFile = function(url) {

	var that = this;
	
	var loader = new Vizi.Loader;
	loader.addEventListener("loaded", function(data) { that.onLoadComplete(data, loadStartTime); }); 
	loader.addEventListener("progress", function(progress) { that.onLoadProgress(progress); }); 

	this.loadStartTime = Date.now();
	loader.loadScene(url);
	
	if (this.loadStatus)
		this.loadStatus.style.display = 'block';		
}

futurgo.prototype.onLoadComplete = function(data, loadStartTime)
{
	// Hide the loader bar
	this.loadStatus.style.display = 'none';		

	var scene = data.scene;
	this.viewer.replaceScene(data);

	var loadTime = (Date.now() - this.loadStartTime) / 1000;
	Vizi.System.log("Loaded " + loadTime.toFixed(2) + " seconds.");

	this.useCamera("setup");

	var that = this;
	scene.map(/windows_front|windows_rear/, function(o) {
		var fader = new Vizi.FadeBehavior({duration:2, opacity:.8});
		o.addComponent(fader);
		setTimeout(function() {
			fader.start();
		}, 2000);

		var picker = new Vizi.Picker;
		picker.addEventListener("mouseover", that.onMouseOver("glass"));
		picker.addEventListener("mouseout", that.onMouseOut("glass"));
		o.addComponent(picker);
	});

	var frame_parts_exp =
		/rear_view_arm_L|rear_view_arm_R|rear_view_frame_L|rear_view_frame_R/;

	scene.map(frame_parts_exp, function(o) {
		o.map(Vizi.Visual, function(v) {
			this.part_materials.push(v.material);
		});
	});

	scene.map(/body2|rear_view_arm_L|rear_view_arm_R/, function(o) {
		var picker = new Vizi.Picker;
		picker.addEventListener("mouseover", that.onMouseOver("body"));
		picker.addEventListener("mouseout", that.onMouseOut("body"));
		o.addComponent(picker);
	});

	scene.map("wheels", function(o) {

		var picker = new Vizi.Picker;
		picker.addEventListener("mouseover", that.onMouseOver("wheels"));
		picker.addEventListener("mouseout", that.onMouseOut("wheels"));
		o.addComponent(picker);
	});
	
	var main = scene.findNode("vizi_mobile");
	var carousel = new Vizi.RotateBehavior({autoStart:true, duration:20});
	main.addComponent(carousel);
}

futurgo.prototype.onLoadProgress = function(progress)
{
	// Update the laoder bar
	var percentProgress = progress.loaded / progress.total * 100;
	var loadStatus = document.getElementById("loadStatus");
	this.loadStatus.innerHTML = "Loading scene... " + percentProgress.toFixed(0) + " %";
}

futurgo.prototype.useCamera = function(name) {
	var cameraNames = this.viewer.cameraNames;
	var i, len = cameraNames.length;
	for (i = 0; i < len; i++) {
		if (cameraNames[i] == name) {
			this.viewer.useCamera(i);
			break;
		}
	}		
}

futurgo.prototype.playAnimation = function(name, loop) {
	var animationNames = this.viewer.keyFrameAnimatorNames;
	var index = animationNames.indexOf(name);
	if (index >= 0)
	{
		this.viewer.playAnimation(index, loop);
	}
}

futurgo.prototype.stopAnimation = function(name) {
	var animationNames = this.viewer.keyFrameAnimatorNames;
	var index = animationNames.indexOf(name);
	if (index >= 0)
	{
		this.viewer.stopAnimation(index);
	}
}

futurgo.prototype.playOpenAnimations = function() {	
	this.playAnimation("window_rear_open.matrix_window_rear_open");
	this.playAnimation("window_front_open.matrix_window_front_open");
	this.playAnimation("animation_window_front_open");
	this.playAnimation("animation_window_rear_open");
}

futurgo.prototype.playCloseAnimations = function() {	
	this.playAnimation("window_rear_close.matrix_window_rear_close");
	this.playAnimation("window_front_close.matrix_window_front_close");
	this.playAnimation("animation_window_front_close");
	this.playAnimation("animation_window_rear_close");
}

futurgo.prototype.toggleInterior = function() {
	this.vehicleOpen = !this.vehicleOpen;
	if (this.vehicleOpen) {
		this.playOpenAnimations();
		return;
		setTimeout(function() {
			this.useCamera("interior");
		}, 2000);
	}
	else {
		this.playCloseAnimations();
		return;
		setTimeout(function() {
			this.useCamera("setup");
		}, 2000);
	}
}

futurgo.prototype.playWheelAnimations = function() {
	this.playAnimation("wheel_L.matrix_wheel_L", true);
	this.playAnimation("wheel_R.matrix_wheel_R", true);
	this.playAnimation("wheel_front.matrix_wheel_front", true);
	this.playAnimation("animation_wheel_front", true);
	this.playAnimation("animation_wheel_L", true);
	this.playAnimation("animation_wheel_R", true);
}

futurgo.prototype.stopWheelAnimations = function() {
	this.stopAnimation("wheel_L.matrix_wheel_L");
	this.stopAnimation("wheel_R.matrix_wheel_R");
	this.stopAnimation("wheel_front.matrix_wheel_front");
	this.stopAnimation("animation_wheel_front");
	this.stopAnimation("animation_wheel_L");
	this.stopAnimation("animation_wheel_R");
}

futurgo.prototype.toggleWheelAnimations = function() {
	this.wheelsMoving = !this.wheelsMoving;
	if (this.wheelsMoving) {
		this.playWheelAnimations();
	}
	else {
		this.stopWheelAnimations();
	}
}

futurgo.prototype.onMouseOver = function(what) {
	if (this.mouseOverCallback)
		this.mouseOverCallback(what);
}

futurgo.prototype.onMouseOut = function(what) {
	if (this.mouseOutCallback)
		this.mouseOutCallback(what);
}

futurgo.URL = "./models/vizi_mobile_tc01/vizi_mobile_tc01.json";