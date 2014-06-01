MysteryPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var mysteryScript = new MysteryScript();
	obj.addComponent(mysteryScript);
	
	return obj;
}


MysteryScript = function(param) {
	BrushScript.call(this, param);
}

goog.inherits(MysteryScript, BrushScript);

MysteryScript.prototype.realize = function()
{
    var texture;
    this.name = 'mystery';
    this.wormholeSpeed = 1;
    this.riseSpeed = .1;
    this.numEmitters = 20;
    this.emitterActivateFraction = 1 / this.numEmitters;
    this.brushEmitters = [];
    this.height = 220;
    this.distanceFromPlayer = 50;
    this.paintTimeoutInterval = 50;
    this.startingPos = new THREE.Vector3(0, 0, 0);
    this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
    texture = THREE.ImageUtils.loadTexture('../images/smokeparticle.png');
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.particleGroup = new ShaderParticleGroup({
      texture: texture,
      maxAge: 20
    });
    
    this.initializePaint();
    
    var brush = new Vizi.Object;
    var visual = new Vizi.Visual({object:this.particleGroup.mesh});
    brush.addComponent(visual);
    this._object.addChild(brush);
}

MysteryScript.prototype.initializePaint = function() {
	
	var colorStart, i, brushEmitter, _i, _ref, _results;

    for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        colorStart = new THREE.Color();
        colorStart.setRGB(1.0, 0, 0);

        brushEmitter = new ShaderParticleEmitter({
            size: 10,
            sizeEnd: 100000,
            colorStart: colorStart,
            particlesPerSecond: 1,
            opacityStart: 0.2,
            opacityMiddle: 1,
            opacityEnd: 1
      });
      this.particleGroup.addEmitter(brushEmitter);
      this.brushEmitters.push(brushEmitter);
      brushEmitter.disable();
    }
}

MysteryScript.prototype.startPaint = function() {

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

MysteryScript.prototype.endPaint = function() {
    return window.clearTimeout(this.paintTimeout);
}

MysteryScript.prototype.update = function() {
    return this.particleGroup.tick();
}
