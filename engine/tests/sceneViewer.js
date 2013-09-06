/**
 * @author Tony Parisi / http://www.tonyparisi.com
 */

SceneViewer = function(param)
{
	// Chain to superclass
	Vizi.Application.call(this, param);
	
	// Set up stats info
	this.lastFPSUpdateTime = 0;
	
	this.renderStats = { fps : 0 };
	this.sceneStats = { meshCount : 0, faceCount : 0 };
	
	// Tuck away prefs based on param
	this.headlightOn = (param.headlight !== undefined) ? param.headlight : true;
	this.showGrid = (param.showGrid !== undefined) ? param.showGrid : true;
	this.showBoundingBox = (param.showBoundingBox !== undefined) ? param.showBoundingBox : false;

	this.gridSize = param.gridSize || SceneViewer.DEFAULT_GRID_SIZE;
	this.gridStepSize = param.gridStepSize || SceneViewer.DEFAULT_GRID_STEP_SIZE;	

	// Set up backdrop objects for empty scene
	this.initScene();

	// Set up shadows - maybe make this a pref
	Vizi.Graphics.instance.enableShadows(true);
}

goog.inherits(SceneViewer, Vizi.Application);

SceneViewer.prototype.initScene = function()
{
	this.sceneRoot = new Vizi.Object;
	this.addObject(this.sceneRoot);

	this.gridRoot = new Vizi.Object;
	this.addObject(this.gridRoot);
	this.grid = null;	
	this.createGrid();
	
	this.controller = Vizi.Prefabs.ModelController({active:true, headlight:true});
	this.controllerScript = this.controller.getComponent(Vizi.ModelControllerScript);
	this.addObject(this.controller);

	this.scenes = [];
	this.keyFrameAnimators = [];
	this.keyFrameAnimatorNames = [];
	this.cameras = [];
	this.cameraNames = [];
	this.lights = [];
	this.lightNames = [];
	this.lightIntensities = [];
	this.lightColors = [];
	this.mouseCallbacks = {};	
}

SceneViewer.prototype.runloop = function()
{
	var updateInterval = 1000;
	
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

SceneViewer.prototype.replaceScene = function(data)
{
	// hack for now - do this for real after computing scene bounds
	
	var i, len = this.scenes.length;
	for (i = 0; i < len; i++)
	{
		this.sceneRoot.removeChild(this.scenes[i]);
	}
	
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
	this.cameras.push(this.controllerScript.viewpoint.camera);
	this.controllerScript.viewpoint.name = "[default]";
	this.cameraNames.push("[default]");

	this.controllerScript.viewpoint.camera.active = true;
	
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
	
	this.fitToScene();
	this.calcSceneStats();
}

SceneViewer.prototype.addToScene = function(data)
{	
	this.sceneRoot.addChild(data.scene);
	
	if (!this.cameras.length)
	{
		this.cameras.push(this.controllerScript.viewpoint.camera);
		this.cameraNames.push("[default]");
		this.controllerScript.viewpoint.camera.setActive(true);
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
			this.cameraNames.push(camera.name);
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
			this.lightNames.push(data.lights[i].name);
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
	
	this.scenes.push(data.scene);
	this.calcSceneStats();
}

SceneViewer.prototype.copyCameraValues = function(oldCamera, newCamera)
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

SceneViewer.prototype.bindCamera = function(index, copyValues)
{
	if (this.cameras && this.cameras[index])
	{
		var currentCamera = Vizi.CameraManager.activeCamera;
		var camera = this.cameras[index];
		camera.active = true;
		
		if (copyValues)
		{
			this.copyCameraValues(currentCamera, camera)
		}		
	}
}

SceneViewer.prototype.useCamera = function(index) {
	this.bindCamera(index);
	if (index != 0)
		this.bindCamera(0, true);
}


SceneViewer.prototype.toggleLight = function(index)
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

SceneViewer.prototype.playAnimation = function(index)
{
	if (this.keyFrameAnimators && this.keyFrameAnimators[index])
	{
		this.keyFrameAnimators[index].stop();
		this.keyFrameAnimators[index].start();
	}
}

SceneViewer.prototype.stopAnimation = function(index)
{
	if (this.keyFrameAnimators && this.keyFrameAnimators[index])
	{
		this.keyFrameAnimators[index].stop();
	}
}

SceneViewer.prototype.playAllAnimations = function()
{
	if (this.keyFrameAnimators)
	{
		var i, len = this.keyFrameAnimators.length;
		for (i = 0; i < len; i++)
		{
			this.keyFrameAnimators[i].stop();
			this.keyFrameAnimators[i].start();
		}
	}
}

SceneViewer.prototype.stopAllAnimations = function()
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

SceneViewer.prototype.setHeadlightOn = function(on)
{
	this.controllerScript.headlight.intensity = on ? 1 : 0;
	this.headlightOn = on;
}

SceneViewer.prototype.setGridOn = function(on)
{
	if (this.grid)
	{
		this.grid.object.visible = on;
	}
}

SceneViewer.prototype.setAmbientLightOn = function(on)
{
	this.ambientLight.intensity = on ? 1 : 0;
	this.ambientLightOn = on;
}

SceneViewer.prototype.createGrid = function()
{
	if (this.gridRoot && this.grid)
	{
		 this.gridRoot.removeComponent(this.grid);
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

	var line_material = new THREE.LineBasicMaterial( { color: SceneViewer.GRID_COLOR, 
		opacity:SceneViewer.GRID_OPACITY } );
	
	var gridObject = new THREE.Line( geometry, line_material, THREE.LinePieces );
	gridObject.visible = this.showGrid;
	this.grid = new Vizi.Visual({ object : gridObject });

	this.gridRoot.addComponent(this.grid);
}

SceneViewer.prototype.fitToScene = function()
{
	function log10(val) {
		  return Math.log(val) / Math.LN10;
		}

	this.boundingBox = Vizi.SceneUtils.computeBoundingBox(this.sceneRoot);
	var scale = this.sceneRoot._children[0].transform.object.scale;
	var mat = new THREE.Matrix4().scale(scale);
	this.boundingBox.applyMatrix4(mat);
	// heuristic, who knows ?
	if (this.boundingBox.max.z < 1) {
		this.controllerScript.camera.near = 0.01;
		this.controllerScript.controls.userPanSpeed = 0.01;
	}
	else {
		this.controllerScript.controls.userPanSpeed = 1;
	}
	
	
	var center = this.boundingBox.max.clone().add(this.boundingBox.min).multiplyScalar(0.5);
	this.controllerScript.center = center;
	var campos = new THREE.Vector3(0, this.boundingBox.max.y, this.boundingBox.max.z * 2);
	this.controllerScript.camera.position.copy(campos);
	this.controllerScript.camera.position.z *= 2;

	if (this.showBoundingBox) {
		var geo = new THREE.CubeGeometry(this.boundingBox.max.x - this.boundingBox.min.x,
				this.boundingBox.max.y - this.boundingBox.min.y,
				this.boundingBox.max.z - this.boundingBox.min.z);
		var mat = new THREE.MeshBasicMaterial({color:0x888888, transparent:true, wireframe:true, opacity:.2})
		var cube = new THREE.Mesh(geo, mat);
		cube.position.add(center);
		this.sceneRoot.transform.object.add(cube);
	}

	return;
	
	var extent = this.boundingBox.max.clone().subSelf(this.boundingBox.min);
	
	this.sceneRadius = extent.length();
	
	var scope = Math.pow(10, Math.ceil(log10(this.sceneRadius)));
	
	this.gridSize = scope;
	this.gridStepSize = scope / 100;

	var cx = (this.boundingBox.max.x + this.boundingBox.min.x) / 2;
	var cy = (this.boundingBox.max.y + this.boundingBox.min.y) / 2;
	var cz = (this.boundingBox.max.z + this.boundingBox.min.z) / 2;

	var x = cx;
	var y = cy + 1.6; //  + this.boundingBox.min.y;
	var z = this.boundingBox.max.z + 10;
	
	this.controller.transform.position.set(cx, y, this.sceneRadius);
	this.controllerScript.setCameraTurn(new THREE.Vector3);
	this.controllerScript.setCameraTilt(new THREE.Vector3);
	this.controllerScript.walkSpeed = this.gridStepSize;	
	
	this.createGrid();
}

SceneViewer.prototype.calcSceneStats = function()
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
	
	this.dispatchEvent("scenestats", this.sceneStats);	
}

SceneViewer.prototype.findCallback = function(n, str, found)
{
	if (typeof(str) == "string")
	{
		if (n.name == str)
			found.push(n);
	}
	else if (str instanceof RegExp)
	{
		var match  = n.name.match(str);
		if (match && match.length)
			found.push(n);
	}
}

SceneViewer.prototype.findNode = function(str)
{
	var that = this;
	var found = [];
	this.sceneRoot.transform.object.traverse(this.sceneRoot.transform.object, function (n) { that.findCallback(n, str, found); });
	
	return found;
}

SceneViewer.prototype.addMouseCallback = function(node, callback)
{
	if (!node.name || !callback)
		return;
	
	this.mouseCallbacks[node.name] = callback;
}

SceneViewer.prototype.handleMouse = function(type, pageX, pageY, eltX, eltY)
{
	return;
	
	var pick = Vizi.Graphics.instance.nodeFromMouse(eltX, eltY);
	var node = pick ? pick.node : null;
	
	var callback = null;
	
	switch (type)
	{
		case "up" :
			if (this.clickedNode)
			{
				callback = this.mouseCallbacks[this.clickedNode.name];
				if (callback)
					callback(this.clickedNode, "clicked", pageX, pageY, eltX, eltY);
				
				this.clickedNode = null;
			}
			
			break;
		
		case "down" :
			this.overNode = null;
			this.clickedNode = node;
			break;

		case "move" :
			if (!this.clickedNode)
			{
				if (node != this.overNode)
				{
					if (this.overNode)
					{
						callback = this.mouseCallbacks[this.overNode.name];
						if (callback)
							callback(this.overNode, "out", pageX, pageY, eltX, eltY);
					}
					
					this.overNode = node;
					
					if (this.overNode)
					{
						callback = this.mouseCallbacks[this.overNode.name];
						if (callback)
							callback(this.overNode, "over", pageX, pageY, eltX, eltY);
					}
				}
			}
			else
			{				
			}
			break;
	}
}

SceneViewer.prototype.onMouseMove = function(pageX, pageY, eltX, eltY)
{
	this.handleMouse("move", pageX, pageY, eltX, eltY);
	
	Vizi.Application.prototype.onMouseMove.call(this, eltX, eltY);
}

SceneViewer.prototype.onMouseDown = function(pageX, pageY, eltX, eltY)
{
	this.handleMouse("down", pageX, pageY, eltX, eltY);
	
	Vizi.Application.prototype.onMouseDown.call(this, eltX, eltY);
}

SceneViewer.prototype.onMouseUp = function(pageX, pageY, eltX, eltY)
{
	this.handleMouse("up", pageX, pageY, eltX, eltY);
	
	Vizi.Application.prototype.onMouseUp.call(this, eltX, eltY);
}



SceneViewer.DEFAULT_GRID_SIZE = 100;
SceneViewer.DEFAULT_GRID_STEP_SIZE = 1;
SceneViewer.GRID_COLOR = 0x000000;
SceneViewer.GRID_OPACITY = 0.2;
