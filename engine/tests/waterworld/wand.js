WandPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var wandScript = new WandScript();
	obj.addComponent(wandScript);
	
	return obj;
}


WandScript = function(param) {
	BrushScript.call(this, param);
}

goog.inherits(WandScript, BrushScript);

WandScript.prototype.realize = function()
{
    var texture;
    this.name = 'wand';
    this.numEmitters = 200;
    this.emitterActivateFraction = 1 / this.numEmitters;
    this.brushEmitters = [];
    this.height = 220;
    this.distanceFromPlayer = 50;
    this.paintTimeoutInterval = 50;
    this.startingPos = new THREE.Vector3(0, 0, 0);
    this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
    texture = THREE.ImageUtils.loadTexture('../images/smokeparticle.png');
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.particleGroup = new ShaderParticleGroup({
      texture: texture,
      maxAge: 5
    });
    
    this.initializePaint();
    
    var brush = new Vizi.Object;
    var visual = new Vizi.Visual({object:this.particleGroup.mesh});
    brush.addComponent(visual);
    this._object.addChild(brush);
}

WandScript.prototype.initializePaint = function() {
	
    var colorEnd, colorStart, i, brushEmitter, _i, _ref, _results;

    for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      colorStart = new THREE.Color();
      colorStart.setRGB(0, Math.random(), 0);
      colorEnd = new THREE.Color();
      colorEnd.setRGB(0, Math.random(), 0);
      brushEmitter = new ShaderParticleEmitter({
        size: 20,
        sizeEnd: 10,
        colorStart: colorStart,
        colorEnd: colorEnd,
        particlesPerSecond: 1,
        opacityStart: 0.2,
        opacityMiddle: 0.4,
        opacityEnd: 0
      });
      this.particleGroup.addEmitter(brushEmitter);
      this.brushEmitters.push(brushEmitter);
      brushEmitter.disable();
    }
}

WandScript.prototype.startPaint = function() {
	
    var direction, brushEmitter, _i, _len, _ref,
    _this = this;
	this.fakeObject.position.copy(Vizi.Graphics.instance.camera.position);
	direction = new THREE.Vector3(0, 0, -1);
	direction.transformDirection(Vizi.Graphics.instance.camera.matrixWorld);
	this.fakeObject.translateZ(direction.z * this.distanceFromPlayer);
	this.fakeObject.translateY(direction.y * this.distanceFromPlayer);
	this.fakeObject.translateX(direction.x * this.distanceFromPlayer);
	_ref = this.brushEmitters;
	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		brushEmitter = _ref[_i];
    
		if (Math.random() < this.emitterActivateFraction) {
			brushEmitter.position.copy(this.fakeObject.position);
			brushEmitter.position.y = Math.max(5, brushEmitter.position.y);
			brushEmitter.enable();
		}
	}
	

	this.paintTimeout = setTimeout(function() {
		return _this.startPaint();
		}, 
		this.paintTimeoutInterval);
}

WandScript.prototype.endPaint = function() {
    return window.clearTimeout(this.paintTimeout);
}

WandScript.prototype.update = function() {
    return this.particleGroup.tick();
}
