
WaterWorld = function(param) {

	Vizi.Application.call(this, param);
	
	this.init();
}

goog.inherits(WaterWorld, Vizi.Application);

WaterWorld.prototype.init = function() {
	
	var cam = new Vizi.PerspectiveCamera;
	var camera = new Vizi.Object;
	camera.addComponent(cam);
	cam.active = true;

	this.addObject(camera);
	
	var controller = Vizi.Prefabs.ModelController({active:true, headlight:false, 
	});
	var controllerScript = controller.getComponent(Vizi.ModelControllerScript);
	controllerScript.camera = cam;
	this.addObject(controller);
	
	var cube = new Vizi.Object;

	var visual = new Vizi.Visual(
			{ geometry: new THREE.CubeGeometry(2, 2, 2),
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
	
	var bounceBehavior = new Vizi.BounceBehavior({autoStart:false, 
		loop:true, bounceVector:new THREE.Vector3(0, 5, 0),
		duration:2});
	cube.addComponent(bounceBehavior);

	this.addObject(cube);

	var cube = new Vizi.Object;

	var visual = new Vizi.Visual(
			{ geometry: new THREE.CubeGeometry(2, 2, 2),
				material: new THREE.MeshPhongMaterial({
					color:0x00ff00,
					reflectivity:0.8,
					refractionRatio:0.1
					})
			});


	cube.transform.position.set(2, 1, -4);
	cube.addComponent(visual);

	var bounceBehavior = new Vizi.BounceBehavior({autoStart:false, 
		loop:true, bounceVector:new THREE.Vector3(0, 0, -20),
		duration:5});
	cube.addComponent(bounceBehavior);
	this.addObject(cube);
	
	var l1 = new Vizi.Object;
	var light1 = new Vizi.DirectionalLight({direction: new THREE.Vector3(-1, -2, -1)});
	l1.addComponent(light1);
	this.addObject(l1);


	var l2 = new Vizi.Object;
	var light2 = new Vizi.DirectionalLight({direction: new THREE.Vector3(1, 1, 1)});
	l2.addComponent(light2);
	this.addObject(l2);
	
	var water = WaterPrefab();
	this.addObject(water);
	
}

