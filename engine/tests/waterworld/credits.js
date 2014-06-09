CreditsPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var creditsScript = new CreditsScript();
	obj.addComponent(creditsScript);

	var size = 2;
	var height = .2;
	var value = "PartiArt";

	var hover = .3,
	curveSegments = 4,
	bevelThickness = .02,
	bevelSize = .01,
	bevelSegments = 3,
	bevelEnabled = true,

	font = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
	weight = "bold", // normal bold
	style = "normal"; // normal italic

	var textGeo = new THREE.TextGeometry( value, {

		size: size,
		height: height,
		curveSegments: curveSegments,

		font: font,
		weight: weight,
		style: style,

		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,

		material: 0,
		extrudeMaterial: 1

	});

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();
	THREE.GeometryUtils.center(textGeo);

	var textmat = new THREE.MeshFaceMaterial( [ 
	                    					new THREE.MeshPhongMaterial( { color: 0x006699, shading: THREE.FlatShading } ), // front
	                    					new THREE.MeshPhongMaterial( { color: 0x006699, shading: THREE.SmoothShading } ) // side
	                    				] );


	// Create the cube
	var text = new Vizi.Object;	
	var visual = new Vizi.Visual(
			{ geometry: textGeo,
				material: textmat
			});
	text.addComponent(visual);

	text.transform.position.y = 1;
	
	var rotator = new Vizi.RotateBehavior({autoStart:true, duration:5});
	
	text.addComponent(rotator);
	
	
	return text;
}

CreditsScript = function(param) {
	this.running = false;
}

goog.inherits(CreditsScript, Vizi.Script);

CreditsScript.prototype.realize = function() {
}

CreditsScript.prototype.update = function() {
}

CreditsScript.prototype.show = function() {
}

