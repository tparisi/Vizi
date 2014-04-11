/**
 * @fileoverview Viewer class - Application Subclass for Model/Scene Viewer
 * @author Tony Parisi / http://www.tonyparisi.com
 */

goog.provide('Vizi.Viewer');

Vizi.Viewer = function(param)
{
	// Chain to superclass
	Vizi.Application.call(this, param);
	
	// Set up stats info
	this.lastFPSUpdateTime = 0;
	
	this.renderStats = { fps : 0 };
	this.sceneStats = { meshCount : 0, faceCount : 0, boundingBox:new THREE.Box3 };
	
	// Tuck away prefs based on param
	this.renderStatsUpdateInterval = (param.renderStatsUpdateInterval !== undefined) ? param.renderStatsUpdateInterval : 1000;
	this.loopAnimations = (param.loopAnimations !== undefined) ? param.loopAnimations : false;
	this.headlightOn = (param.headlight !== undefined) ? param.headlight : true;
	this.firstPerson = (param.firstPerson !== undefined) ? param.firstPerson : false;
	this.showGrid = (param.showGrid !== undefined) ? param.showGrid : false;
	this.showBoundingBox = (param.showBoundingBox !== undefined) ? param.showBoundingBox : false;
	this.showBoundingBoxes = (param.showBoundingBoxes !== undefined) ? param.showBoundingBoxes : false;
	this.allowPan = (param.allowPan !== undefined) ? param.allowPan : true;
	this.allowZoom = (param.allowZoom !== undefined) ? param.allowZoom : true;
	this.oneButton = (param.oneButton !== undefined) ? param.oneButton : false;
	this.gridSize = param.gridSize || Vizi.Viewer.DEFAULT_GRID_SIZE;
	this.gridStepSize = param.gridStepSize || Vizi.Viewer.DEFAULT_GRID_STEP_SIZE;
	this.flipY = (param.flipY !== undefined) ? param.flipY : false;
	this.highlightedObject = null;
	this.highlightDecoration = null;
	
	// Set up backdrop objects for empty scene
	this.initScene();

	// Set up shadows - maybe make this a pref
	Vizi.Graphics.instance.enableShadows(true);
}

goog.inherits(Vizi.Viewer, Vizi.Application);

Vizi.Viewer.prototype.initScene = function()
{
	this.sceneRoot = new Vizi.Object;
	this.addObject(this.sceneRoot);
	if (this.flipY) {
		this.sceneRoot.transform.rotation.x = -Math.PI / 2;
	}

	this.gridRoot = new Vizi.Object;
	this.addObject(this.gridRoot);
	this.grid = null;	
	this.gridPicker = null;	
	this.createGrid();
	
	if (this.firstPerson) {
		this.controller = Vizi.Prefabs.FirstPersonController({active:true, headlight:true});
		this.controllerScript = this.controller.getComponent(Vizi.FirstPersonControllerScript);
	}
	else {
		this.controller = Vizi.Prefabs.ModelController({active:true, headlight:true, 
			allowPan:this.allowPan, allowZoom:this.allowZoom, oneButton:this.oneButton});
		this.controllerScript = this.controller.getComponent(Vizi.ModelControllerScript);
	}
	this.addObject(this.controller);

	var viewpoint = new Vizi.Object;
	this.defaultCamera = new Vizi.PerspectiveCamera({active:true});
	viewpoint.addComponent(this.defaultCamera);
	viewpoint.name = "[default]";
	this.addObject(viewpoint);

	this.controllerScript.camera = this.defaultCamera;
	
	var ambientLightObject = new Vizi.Object;
	this.ambientLight = new Vizi.AmbientLight({color:0xFFFFFF, intensity : this.ambientOn ? 1 : 0 });
	this.addObject(ambientLightObject);
	
	this.scenes = [];
	this.keyFrameAnimators = [];
	this.keyFrameAnimatorNames = [];
	this.cameras = [];
	this.cameraNames = [];
	this.lights = [];
	this.lightNames = [];
	this.lightIntensities = [];
	this.lightColors = [];
}

Vizi.Viewer.prototype.runloop = function()
{
	var updateInterval = this.renderStatsUpdateInterval;
	
	Vizi.Application.prototype.runloop.call(this);
	if (Vizi.Graphics.instance.frameRate)
	{
		var now = Date.now();
		var deltat = now - this.lastFPSUpdateTime;
		if (deltat > updateInterval)
		{
			this.renderStats.fps = Vizi.Graphics.instance.frameRate.toFixed(0);
			this.dispatchEvent("renderstats", this.renderStats);
			this.lastFPSUpdateTime = now;
		}
	}
}

Vizi.Viewer.prototype.replaceScene = function(data)
{
	// hack for now - do this for real after computing scene bounds
	
	var i, len = this.sceneRoot._children.length;
	var childrenToRemove = [];
	for (i = 0; i < len; i++)
	{
		var child = this.sceneRoot._children[i];
		childrenToRemove.push(child);
	}
	
	for (i = 0; i < len; i++) {
		this.sceneRoot.removeChild(childrenToRemove[i]);
	}
	
	this.sceneRoot.removeComponent(this.sceneRoot.findNode(Vizi.Decoration));
	
	this.scenes = [data.scene];
	this.sceneRoot.addChild(data.scene);
	
	var bbox = Vizi.SceneUtils.computeBoundingBox(data.scene);
	
	if (this.keyFrameAnimators)
	{
		var i, len = this.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.sceneRoot.removeComponent(this.keyFrameAnimators[i]);
		}
		
		this.keyFrameAnimators = [];
		this.keyFrameAnimatorNames = [];
	}
	
	if (data.keyFrameAnimators)
	{
		var i, len = data.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.sceneRoot.addComponent(data.keyFrameAnimators[i]);
			this.keyFrameAnimators.push(data.keyFrameAnimators[i]);
			this.keyFrameAnimatorNames.push(data.keyFrameAnimators[i].animationData[0].name)
		}		
	}
	
	this.cameras = [];
	this.cameraNames = [];
	this.cameras.push(this.defaultCamera);
	this.camera = this.defaultCamera;
	this.cameraNames.push("[default]");

	this.controllerScript.camera = this.defaultCamera;
	this.controllerScript.camera.active = true;
	
	if (data.cameras)
	{
		var i, len = data.cameras.length;
		for (i = 0; i < len; i++)
		{
			var camera = data.cameras[i];
			camera.aspect = container.offsetWidth / container.offsetHeight;
			
			this.cameras.push(camera);
			this.cameraNames.push(camera._object.name);
		}		
	}
	
	this.lights = [];
	this.lightNames = [];
	this.lightIntensities = [];
	this.lightColors = [];
	
	if (data.lights)
	{
		var i, len = data.lights.length;
		for (i = 0; i < len; i++)
		{
			var light = data.lights[i];
			if (light instanceof THREE.SpotLight)
			{
				light.castShadow = true;
				light.shadowCameraNear = 1;
				light.shadowCameraFar = Vizi.Light.DEFAULT_RANGE;
				light.shadowCameraFov = 90;

				// light.shadowCameraVisible = true;

				light.shadowBias = 0.0001;
				light.shadowDarkness = 0.3;

				light.shadowMapWidth = 2048;
				light.shadowMapHeight = 2048;
				
				light.target.position.set(0, 0, 0);
			}
			
			this.lights.push(data.lights[i]);
			this.lightNames.push(data.lights[i]._object.name);
			this.lightIntensities.push(data.lights[i].intensity);
			this.lightColors.push(data.lights[i].color.clone());
		}
		
		this.controllerScript.headlight.intensity = len ? 0 : 1;
		this.headlightOn = len <= 0;
	}
	else
	{
		this.controllerScript.headlight.intensity = 1;
		this.headlightOn = true;
	}
	
	this.initHighlight();
	this.fitToScene();
	this.calcSceneStats();
}

Vizi.Viewer.prototype.addToScene = function(data)
{	
	this.sceneRoot.addChild(data.scene);
	
	if (!this.cameras.length)
	{
		this.cameras = [];
		this.cameraNames = [];
		this.cameras.push(this.defaultCamera);
		this.camera = this.defaultCamera;
		this.cameraNames.push("[default]");

		this.controllerScript.camera = this.defaultCamera;
		this.controllerScript.camera.active = true;
	}
	
	if (data.keyFrameAnimators)
	{
		var i, len = data.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.sceneRoot.addComponent(data.keyFrameAnimators[i]);
			this.keyFrameAnimators.push(data.keyFrameAnimators[i]);
			this.keyFrameAnimatorNames.push(data.keyFrameAnimators[i].animationData[0].name)
		}		
	}
	
	if (data.cameras)
	{
		var i, len = data.cameras.length;
		for (i = 0; i < len; i++)
		{
			var camera = data.cameras[i];
			camera.aspect = container.offsetWidth / container.offsetHeight;
			
			this.cameras.push(camera);
			this.cameraNames.push(camera._object.name);
		}		
	}
	
	if (data.lights)
	{
		var i, len = data.lights.length;
		for (i = 0; i < len; i++)
		{
			var light = data.lights[i];
			if (light instanceof THREE.SpotLight)
			{
				light.castShadow = true;
				light.shadowCameraNear = 1;
				light.shadowCameraFar = Vizi.Light.DEFAULT_RANGE;
				light.shadowCameraFov = 90;

				// light.shadowCameraVisible = true;

				light.shadowBias = 0.0001;
				light.shadowDarkness = 0.3;

				light.shadowMapWidth = 2048;
				light.shadowMapHeight = 2048;
				
				light.target.position.set(0, 0, 0);
			}
			
			this.lights.push(data.lights[i]);
			this.lightNames.push(data.lights[i]._object.name);
			this.lightIntensities.push(data.lights[i].intensity);
			this.lightColors.push(data.lights[i].color.clone());
		}		
	}
	else if (!this.lights.length)
	{
		this.controllerScript.headlight.intensity = 1;
		this.headlightOn = true;
	}
	
	this.scenes.push(data.scene);
	this.initHighlight();
	this.fitToScene();
	this.calcSceneStats();
}

Vizi.Viewer.prototype.createDefaultCamera = function() {
	
	var cam = this.controllerScript.viewpoint.camera.object;
	cam.updateMatrixWorld();
	var position = new THREE.Vector3;
	var quaternion = new THREE.Quaternion;
	var scale = new THREE.Vector3;
	cam.matrixWorld.decompose(position, quaternion, scale);
	var rotation = new THREE.Euler().setFromQuaternion(quaternion);

	var newCamera = new THREE.PerspectiveCamera(cam.fov, cam.aspect, cam.near, cam.far);
	return new Vizi.PerspectiveCamera({object:newCamera});
}

Vizi.Viewer.prototype.copyCameraValues = function(oldCamera, newCamera)
{
	// for now, assume newCamera is in world space, this is too friggin hard
	var cam = oldCamera.object;
	cam.updateMatrixWorld();
	var position = new THREE.Vector3;
	var quaternion = new THREE.Quaternion;
	var scale = new THREE.Vector3;
	cam.matrixWorld.decompose(position, quaternion, scale);
	var rotation = new THREE.Euler().setFromQuaternion(quaternion);
	
	newCamera.position.copy(position);
	newCamera.rotation.copy(rotation);
	
	newCamera.fov = oldCamera.fov;
	newCamera.aspect = oldCamera.aspect;
	newCamera.near = oldCamera.near;
	newCamera.far = oldCamera.far;	
}

Vizi.Viewer.prototype.useCamera = function(id) {

	var index = id;
	
	if (typeof(id) == "string") {
		var cameraNames = this.cameraNames;
		if (this.cameraNames) {
			index = this.cameraNames.indexOf(id);
		}
	}

	if (index >= 0 && this.cameras && this.cameras[index]) {
		this.cameras[index].active = true;
		this.controllerScript.enabled = (index == 0);
	}
}

Vizi.Viewer.prototype.toggleLight = function(index)
{
	if (this.lights && this.lights[index])
	{
		var light = this.lights[index];
		if (light instanceof Vizi.AmbientLight)
		{
			var color = light.color;
			if (color.r != 0 || color.g != 0 || color.b != 0)
				color.setRGB(0, 0, 0);
			else
				color.copy(this.lightColors[index]);
		}
		else
		{
			var intensity = light.intensity;
			if (intensity)
				light.intensity = 0;
			else
				light.intensity = this.lightIntensities[index];
				
		}
	}
}

Vizi.Viewer.prototype.playAnimation = function(index, loop, reverse)
{
	if (loop === undefined)
		loop = this.loopAnimations;
	
	if (this.keyFrameAnimators && this.keyFrameAnimators[index])
	{
		this.keyFrameAnimators[index].loop = loop;
		if (reverse) {
			this.keyFrameAnimators[index].direction = Vizi.KeyFrameAnimator.REVERSE_DIRECTION;
		}
		else {
			this.keyFrameAnimators[index].direction = Vizi.KeyFrameAnimator.FORWARD_DIRECTION;
		}
		
		if (!loop)
			this.keyFrameAnimators[index].stop();

		this.keyFrameAnimators[index].start();
	}
}

Vizi.Viewer.prototype.stopAnimation = function(index)
{
	if (this.keyFrameAnimators && this.keyFrameAnimators[index])
	{
		this.keyFrameAnimators[index].stop();
	}
}

Vizi.Viewer.prototype.playAllAnimations = function(loop, reverse)
{
	if (loop === undefined)
		loop = this.loopAnimations;
	
	if (this.keyFrameAnimators)
	{
		var i, len = this.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.keyFrameAnimators[i].stop();
			
			if (loop)
				this.keyFrameAnimators[i].loop = true;

			if (reverse) {
				this.keyFrameAnimators[i].direction = Vizi.KeyFrameAnimator.REVERSE_DIRECTION;
			}
			else {
				this.keyFrameAnimators[i].direction = Vizi.KeyFrameAnimator.FORWARD_DIRECTION;
			}
			
			this.keyFrameAnimators[i].start();
		}
	}
}

Vizi.Viewer.prototype.stopAllAnimations = function()
{
	if (this.keyFrameAnimators)
	{
		var i, len = this.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.keyFrameAnimators[i].stop();
		}
	}
}

Vizi.Viewer.prototype.setLoopAnimations = function(on)
{
	this.loopAnimations = on;
}

Vizi.Viewer.prototype.setHeadlightOn = function(on)
{
	this.controllerScript.headlight.intensity = on ? 1 : 0;
	this.headlightOn = on;
}

Vizi.Viewer.prototype.setGridOn = function(on)
{
	if (this.grid)
	{
		this.grid.visible = on;
	}
}

Vizi.Viewer.prototype.setBoundingBoxesOn = function(on)
{
	this.showBoundingBoxes = !this.showBoundingBoxes;
	var that = this;
	this.sceneRoot.map(Vizi.Decoration, function(o) {
		if (!that.highlightedObject || (o != that.highlightDecoration)) {
			o.visible = that.showBoundingBoxes;
		}
	});
}

Vizi.Viewer.prototype.setAmbientLightOn = function(on)
{
	this.ambientLight.intensity = on ? 1 : 0;
	this.ambientLightOn = on;
}

Vizi.Viewer.prototype.setFlipY = function(flip) {
	this.flipY = flip;
	if (this.flipY) {
		this.sceneRoot.transform.rotation.x = -Math.PI / 2;
		this.fitToScene();
	}
	else {
		this.sceneRoot.transform.rotation.x = 0;
	}
}

Vizi.Viewer.prototype.initHighlight = function() {
	if (this.highlightedObject) {
		this.highlightedObject.removeComponent(this.highlightDecoration);
	}
	this.highlightedObject = null;
}

Vizi.Viewer.prototype.highlightObject = function(object) {

	if (this.highlightedObject) {
		this.highlightParent.removeComponent(this.highlightDecoration);
	}

	if (object) {
		
		this.highlightDecoration = Vizi.Helpers.BoundingBoxDecoration({
			object : object,
			color : 0xaaaa00
		});
		
		if (object instanceof Vizi.Object) {
			object._parent.addComponent(this.highlightDecoration);
			this.highlightedObject = object;
			this.highlightParent = object._parent;
		}
		else if (object instanceof Vizi.Visual) {
			object._object.addComponent(this.highlightDecoration);
			this.highlightedObject = object._object;
			this.highlightParent = object._object;
		}
	}
	else {
		this.highlightedObject = null;
		this.highlightParent = null;
	}
	
}

Vizi.Viewer.prototype.createGrid = function()
{
	if (this.gridRoot)
	{
		if (this.grid)
			this.gridRoot.removeComponent(this.grid);
		
		if (this.gridPicker)
			this.gridRoot.removeComponent(this.gridPicker);
	}

	// Create a line geometry for the grid pattern
	var floor = -0.04, step = this.gridStepSize, size = this.gridSize;
	var geometry = new THREE.Geometry();

	for ( var i = 0; i <= size / step * 2; i ++ )
	{
		geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
		geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
	
		geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
		geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );
	}

	var line_material = new THREE.LineBasicMaterial( { color: Vizi.Viewer.GRID_COLOR, 
		opacity:Vizi.Viewer.GRID_OPACITY } );
	
	var gridObject = new THREE.Line( geometry, line_material, THREE.LinePieces );
	gridObject.visible = this.showGrid;
	this.grid = new Vizi.Visual({ object : gridObject });

	this.gridRoot.addComponent(this.grid);
	
	this.gridPicker = new Vizi.Picker;
	var that = this;
	this.gridPicker.addEventListener("mouseup", function(e) {
		that.highlightObject(null);
	});
	this.gridRoot.addComponent(this.gridPicker);
}

Vizi.Viewer.prototype.fitToScene = function()
{
	function log10(val) {
		  return Math.log(val) / Math.LN10;
		}

	this.boundingBox = Vizi.SceneUtils.computeBoundingBox(this.sceneRoot);
	
	// For default camera setups-- small scenes (COLLADA, cm), or not clip big scenes
	// heuristic, who knows ?
	this.controllerScript.controls.userPanSpeed = 1;
	if (this.boundingBox.max.z < 1) {
		this.controllerScript.camera.near = 0.01;
		this.controllerScript.controls.userPanSpeed = 0.01;
	}
	else if (this.boundingBox.max.z > 10000) {
		this.controllerScript.camera.far = this.boundingBox.max.z * Math.sqrt(2) * 2;
	}
	else if (this.boundingBox.max.z > 1000) {
		this.controllerScript.camera.far = 20000;
	}
	
	var center = this.boundingBox.max.clone().add(this.boundingBox.min).multiplyScalar(0.5);
	this.controllerScript.center = center;
	if (this.scenes.length == 1) {
		var campos = new THREE.Vector3(0, this.boundingBox.max.y, this.boundingBox.max.z * 2);
		this.controllerScript.camera.position.copy(campos);
		this.controllerScript.camera.position.z *= 2;
		this.cameras[0].position.copy(this.controllerScript.camera.position);
	}
	
	// Bounding box display
	if (true) {
		
		this.sceneRoot.map(Vizi.Object, function(o) {
			if (o._parent) {
				
				var decoration = Vizi.Helpers.BoundingBoxDecoration({
					object : o,
					color : 0x00ff00
				});
				
				o._parent.addComponent(decoration);							
				decoration.visible = this.showBoundingBoxes;
			}
		});
	}

	// Resize the grid
	var extent = this.boundingBox.max.clone().sub(this.boundingBox.min);
	
	this.sceneRadius = extent.length();
	
	var scope = Math.pow(10, Math.ceil(log10(this.sceneRadius)));
	
	this.gridSize = scope;
	this.gridStepSize = scope / 100;
	this.createGrid();
}

Vizi.Viewer.prototype.calcSceneStats = function()
{
	this.meshCount = 0;
	this.faceCount = 0;
	
	var that = this;
	var visuals = this.sceneRoot.findNodes(Vizi.Visual);
	var i, len = visuals.length;
	for (i = 0; i < len; i++) {
		var visual = visuals[i];
		var geometry = visual.geometry;
		var nFaces = geometry.faces ? geometry.faces.length : geometry.attributes.index.array.length / 3;
		this.faceCount += nFaces;
		this.meshCount++;		
	}

	this.sceneStats.meshCount = this.meshCount;
	this.sceneStats.faceCount = this.faceCount;
	this.sceneStats.boundingBox = this.boundingBox;
	
	this.dispatchEvent("scenestats", this.sceneStats);	
}

Vizi.Viewer.prototype.setController = function(type) {
	var center = this.boundingBox.max.clone().add(this.boundingBox.min).multiplyScalar(0.5);
	switch (type) {
		case "model" :
			break;
		case "FPS" :
			center.y = 0;
			break;
	}
	this.controllerScript.center = center;
}

Vizi.Viewer.DEFAULT_GRID_SIZE = 100;
Vizi.Viewer.DEFAULT_GRID_STEP_SIZE = 1;
Vizi.Viewer.GRID_COLOR = 0x202020;
Vizi.Viewer.GRID_OPACITY = 0.2;
