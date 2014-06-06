
WaterWorld = function(param) {

	param.tabstop = true;
	Vizi.Application.call(this, param);
	
	this.init(param);
}

goog.inherits(WaterWorld, Vizi.Application);

WaterWorld.prototype.init = function(param) {

	var addCubes = false,
		fpsController = true,
		addLights = true,
		addStars = true,
		addMeteors = true,
		addCaves = true,
		addBrushes = true;
	
	var riftController = param.riftController;
	
	var cam = new Vizi.PerspectiveCamera;
	cam.far = WaterWorld.EXTENT;
	cam.fov = WaterWorld.FOV;
	var camera = new Vizi.Object;
	camera.addComponent(cam);
	cam.active = true;
	this.camera = cam;
	
	this.addObject(camera);

	if (riftController) {
		var controller = Vizi.Prefabs.RiftController({active:true, 
			headlight:false,
			mouseLook:true,
		});
		var controllerScript = controller.getComponent(Vizi.RiftControllerScript);
		controllerScript.camera = cam;
		controllerScript.moveSpeed = 6;
		
		this.addObject(controller);
	}
	
	if (fpsController) {
		var controller = Vizi.Prefabs.FirstPersonController({active:true, 
			headlight:false,
			mouseLook:false,
			turn: !riftController,
			look: !riftController,
		});
		var controllerScript = controller.getComponent(Vizi.FirstPersonControllerScript);
		controllerScript.moveSpeed = 6;
		controllerScript.turnSpeed = 4;
		controllerScript.lookSpeed = 4;
	}
	else {
		var controller = Vizi.Prefabs.ModelController({active:true, headlight:false, 
		});
		var controllerScript = controller.getComponent(Vizi.ModelControllerScript);		
	}
	
	controllerScript.camera = cam;
	camera.transform.position.set(0, 2, 5);
	this.addObject(controller);
	
	if (addCubes) {
		var cube = new Vizi.Object;
	
		var visual = new Vizi.Visual(
				{ geometry: new THREE.CubeGeometry(.2, .2, .2),
					material: new THREE.MeshPhongMaterial({
						color:0xff0000,
						})
				});
	
	
		cube.transform.position.y = 2;
		cube.addComponent(visual);
	
		var rotateBehavior = new Vizi.RotateBehavior({autoStart:false, 
			loop:true, 
			duration:.5});
		cube.addComponent(rotateBehavior);
		
		var bounceBehavior = new Vizi.BounceBehavior({autoStart:true, 
			loop:true, bounceVector:new THREE.Vector3(0, .5, 0),
			duration:2});
		cube.addComponent(bounceBehavior);
	
		this.addObject(cube);
	
		var cube = new Vizi.Object;
	
		var visual = new Vizi.Visual(
				{ geometry: new THREE.CubeGeometry(.2, .2, .2),
					material: new THREE.MeshPhongMaterial({
						color:0x00ff00,
						reflectivity:0.8,
						refractionRatio:0.1
						})
				});
	
	
		cube.transform.position.set(2, 1, -4);
		cube.addComponent(visual);
	
		var bounceBehavior = new Vizi.BounceBehavior({autoStart:true, 
			loop:true, bounceVector:new THREE.Vector3(0, 0, -2),
			duration:5});
		cube.addComponent(bounceBehavior);
		this.addObject(cube);
	}
	
	if (addLights) {

		var l1 = new Vizi.Object;
		var light1 = new Vizi.DirectionalLight({direction: new THREE.Vector3(-1, -1, -1)});
		l1.addComponent(light1);
		this.addObject(l1);
	
	
		var l2 = new Vizi.Object;
		var light2 = new Vizi.DirectionalLight({direction: new THREE.Vector3(0, -1, -1)});
		l2.addComponent(light2);
		this.addObject(l2);
	}
	
	var water = WaterPrefab();
	this.addObject(water);
	
	if (addStars) {
		var stars = StarsPrefab();
		this.addObject(stars);
	}
	
	if (addMeteors) {
		var meteors = MeteorsPrefab();
		this.addObject(meteors);
	}
	
	if (addCaves) {
		var caves = CavesPrefab();
		this.addObject(caves);
	}
	
	if (addBrushes) {
		var brushes = BrushesPrefab();
		this.addObject(brushes);
		
		this.brushes = brushes.getComponent(BrushesScript);	

		if (Vizi.Gamepad && Vizi.Gamepad.instance) {
			var gamepad = Vizi.Gamepad.instance;
			
			var that = this;
			gamepad.addEventListener( 'buttonsChanged', function(event) {
				that.onGamepadButtonsChanged(event);
			});
		}
	}

	// Time pump for gravity sim etc.
	this.ascending = false;
	this.descending = false;
	var timeobj = new Vizi.Object;
	this.timer = new Vizi.Timer;
	timeobj.addComponent(this.timer);
	var that = this;
	this.timer.addEventListener("time", function(t) {
		that.onTimerTime(t);
	});
	this.addObject(timeobj);
	
	this.timer.start();
}

WaterWorld.prototype.onKeyDown = function(event) {
    switch ( event.keyCode ) {
	    case 82: // R
	      if (this.brushes) {	
	    	  this.brushes.nextBrush();
	      }
	      break;
	    case 67: // c
			this.startAscent();
          break;
        case 32: // space
			this.startDescent();
	      break;
    }
}

WaterWorld.prototype.onKeyUp = function(event) {
    switch ( event.keyCode ) {
	    case 67: // c
			this.endAscent();
          break;
        case 32: // space
			this.endDescent();
	      break;
    }
}

WaterWorld.prototype.onMouseDown = function(event) {
	this.startPaint();
	Vizi.Application.prototype.onMouseDown(event);
}

WaterWorld.prototype.onMouseUp = function(event) {
	this.endPaint();
	Vizi.Application.prototype.onMouseUp(event);
}

WaterWorld.prototype.startPaint = function() {
    if (this.brushes)
    	this.brushes.startPaint();
}

WaterWorld.prototype.endPaint = function() {
    if (this.brushes)
    	this.brushes.endPaint();
}

WaterWorld.prototype.startAscent = function() {
	this.ascending = true;
	this.descending = false;
}

WaterWorld.prototype.endAscent = function() {
	this.ascending = false;
}

WaterWorld.prototype.startDescent = function() {
	this.descending = true;
	this.ascending = false;
}

WaterWorld.prototype.endDescent = function() {
	this.descending = false;
}

WaterWorld.prototype.onGamepadButtonsChanged = function(event) {
    
	var buttons = event.changedButtons;
	
	var i, len = buttons.length;
	for (i = 0; i < len; i++) {
		var button = buttons[i];
		
		switch (button.button) {
			case Vizi.Gamepad.TRIGGER_LEFT : 
				if (this.brushes) {
					if (!button.pressed) {
						this.brushes.nextBrush();
					}
				}
				break;
			case Vizi.Gamepad.TRIGGER_RIGHT : 
				if (this.brushes) {
					if (button.pressed) {
						this.brushes.startPaint();
					}
					else {
						this.brushes.endPaint();
					}
				}
				break;
			case Vizi.Gamepad.STICK_LEFT : 
			case Vizi.Gamepad.SHOULDER_LEFT : 
				if (button.pressed) {
					this.startAscent();
				}
				else {
					this.endAscent();
				}
				break;
			case Vizi.Gamepad.STICK_RIGHT : 
			case Vizi.Gamepad.SHOULDER_RIGHT : 
				if (button.pressed) {
					this.startDescent();
				}
				else {
					this.endDescent();
				}
				break;
		}
	}
}


WaterWorld.prototype.onTimerTime = function(t) {

	if (this.lastTimerTime == 0)
		this.lastTimerTime = t;
	
	var dt = t - this.lastTimerTime;
	this.lastTimerTime = t;
	
	var dy = 0;
	
	if (this.ascending) {
		dy = WaterWorld.ASCENT_SPEED * dt / 1000;
	}
	
	if (this.descending) {
		dy = -WaterWorld.DESCENT_SPEED * dt / 1000;
	}
	
	if (dy) {
		this.camera.position.y += dy;
		this.camera.position.y = Math.max(0, this.camera.position.y);
	}
}

WaterWorld.EXTENT = 100000;
WaterWorld.FOV = 75.0;
WaterWorld.ASCENT_SPEED = 10; // m/s
WaterWorld.DESCENT_SPEED = 10; // m/s

