WaterPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

    var waterNormals = new THREE.ImageUtils.loadTexture('../images/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    var water = new THREE.Water(Vizi.Graphics.instance.renderer, Vizi.Graphics.instance.camera, Vizi.Graphics.instance.scene, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 1,
      distortionScale: 50,
//      sunDirection:new THREE.Vector3(0, 1, 1).normalize(),
//      sunColor:new THREE.Color(0x888888),
//      waterColor:new THREE.Color(0x44ccdd),
    });
    
    var aMeshMirror = new THREE.Mesh(new THREE.PlaneGeometry(WaterPrefab.WATER_WIDTH, WaterPrefab.WATER_WIDTH, 50, 50), water.material);
    aMeshMirror.add(water);
    aMeshMirror.rotation.x = -Math.PI * 0.5;
    
    var visual = new Vizi.Visual({object:aMeshMirror});
	obj.addComponent(visual);
	
	param.water = water;
	var waterScript = new WaterScript(param);
	obj.addComponent(waterScript);
	
	return obj;
}

goog.provide('WaterScript');
goog.require('Vizi.Script');

WaterScript = function(param) {
	Vizi.Script.call(this, param);

	this.water = param.water;
	var that = this;
    this.rippleFactor = 500;
}

goog.inherits(WaterScript, Vizi.Script);

WaterScript.prototype.realize = function()
{
}

WaterScript.prototype.update = function()
{
    this.water.material.uniforms.time.value += 1.0 / this.rippleFactor;
	this.water.render();
}

WaterPrefab.WATER_WIDTH = 100000;