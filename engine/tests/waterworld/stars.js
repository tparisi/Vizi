StarsPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

    var texture;
    var colorStart = new THREE.Color();
    colorStart.setRGB(Math.random(), Math.random(), Math.random());
    texture = THREE.ImageUtils.loadTexture('../images/star.png');
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    
    var starGroup = new ShaderParticleGroup({
      texture: texture,
      blending: THREE.AdditiveBlending,
      maxAge: 10
    });
    
    
    var visual = new Vizi.Visual({object: starGroup.mesh});
    obj.addComponent(visual);
    
    var starScript = new StarsScript({
    	colorStart : colorStart,
    	starGroup : starGroup,
    });

    obj.addComponent(starScript);
    return obj;
}

goog.provide('StarsScript');
goog.require('Vizi.Script');

StarsScript = function(param) {
	Vizi.Script.call(this, param);

	this.colorStart = param.colorStart;
	this.starGroup = param.starGroup;
}

goog.inherits(StarsScript, Vizi.Script);

StarsScript.prototype.realize = function()
{
    this.generateStars();
}

StarsScript.prototype.update = function()
{
	this.starGroup.tick();
}

StarsScript.prototype.generateStars = function() {
    this.starEmitter = new ShaderParticleEmitter({
      type: 'sphere',
      radius: 50000,
      speed: .1,
      size: rnd(4000, 6000),
      sizeSpread: 4000,
      particlesPerSecond: rnd(500, 1100),
      opacityStart: 0,
      opacityMiddle: 1,
      opacityEnd: 0,
      colorStart: this.colorStart,
      colorSpread: new THREE.Vector3(rnd(.1, .5), rnd(.1, .5), rnd(.1, .5))
    });
    return this.starGroup.addEmitter(this.starEmitter);
}
