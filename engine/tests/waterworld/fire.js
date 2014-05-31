FirePrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var fireScript = new FireScript();
	obj.addComponent(fireScript);
	
	return obj;
}


FireScript = function(param) {
	BrushScript.call(this, param);
}

goog.inherits(FireScript, BrushScript);

FireScript.prototype.realize = function()
{
    var texture;
    this.name = 'fire';
    this.numEmitters = 200;
    this.emitterActivateFraction = 1 / this.numEmitters;
    this.brushEmitters = [];
    this.distanceFromPlayer = 50;
    this.paintTimeoutInterval = 50;
    this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
    texture = THREE.ImageUtils.loadTexture('../images/smokeparticle.png');
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.particleGroup = new ShaderParticleGroup({
      texture: texture,
      maxAge: 2
    });
    
    this.initializePaint();
    
    var brush = new Vizi.Object;
    var visual = new Vizi.Visual({object:this.particleGroup.mesh});
    brush.addComponent(visual);
    this._object.addChild(brush);
}

FireScript.prototype.initializePaint = function() {

    var colorEnd, colorStart, i, brushEmitter, _i, _ref, _results;

    for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      colorStart = new THREE.Color();
      colorStart.setHSL(rnd(0.55, 0.65), .3, .3);
      colorEnd = new THREE.Color();
      colorEnd.setHSL(rnd(0, .1), 0.8, 0.3);
      brushEmitter = new ShaderParticleEmitter({
          positionSpread: new THREE.Vector3(2, 7, 2),
          sizeEnd: 15,
          colorStart: colorStart,
          colorEnd: colorEnd,
          particlesPerSecond: 50,
          opacityStart: 0.8,
          opacityMiddle: 1.0,
          opacityEnd: 0.1,
          acceleration: new THREE.Vector3(0, rnd(1, 4), 0),
          velocity: new THREE.Vector3(0, 10, 0),
          accelerationSpread: new THREE.Vector3(3, 1, 3)
      });
      this.particleGroup.addEmitter(brushEmitter);
      this.brushEmitters.push(brushEmitter);
      brushEmitter.disable();
    }
}

FireScript.prototype.startPaint = function() {

    var direction, brushEmitter, _i, _len, _ref,
    _this = this;
	this.fakeObject.position.copy(Vizi.Graphics.instance.camera.position);
	direction = new THREE.Vector3(0, 0, -1);
	this.fakeObject.translateZ(direction.z * this.distanceFromPlayer);
	this.fakeObject.translateY(direction.y * this.distanceFromPlayer);
	this.fakeObject.translateX(direction.x * this.distanceFromPlayer);
	_ref = this.brushEmitters;
	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		brushEmitter = _ref[_i];
    
		if (Math.random() < this.emitterActivateFraction) {
			brushEmitter.position.copy(this.fakeObject.position);
			brushEmitter.position.y = Math.max(0, brushEmitter.position.y - 50);
			brushEmitter.enable();
		}
	}
	

	this.paintTimeout = setTimeout(function() {
		return _this.startPaint();
		}, 
		this.paintTimeoutInterval);
}

FireScript.prototype.endPaint = function() {
    return window.clearTimeout(this.paintTimeout);
}

FireScript.prototype.update = function() {
    return this.particleGroup.tick();
}
