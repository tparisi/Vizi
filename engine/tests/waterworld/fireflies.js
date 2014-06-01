FirefliesPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var firefliesScript = new FirefliesScript();
	obj.addComponent(firefliesScript);
	
	return obj;
}


FirefliesScript = function(param) {
	BrushScript.call(this, param);
}

goog.inherits(FirefliesScript, BrushScript);

FirefliesScript.prototype.realize = function()
{
    var texture;
    this.name = 'fireflies';
    this.wormholeSpeed = 1;
    this.riseSpeed = .1;
    this.numEmitters = 10;
    this.emitterActivateFraction = 1 / this.numEmitters;
    this.brushEmitters = [];
    this.height = 220;
    this.distanceFromPlayer = 70;
    this.paintTimeoutInterval = 1000;
    this.startingPos = new THREE.Vector3(0, 0, 0);
    this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
    texture = THREE.ImageUtils.loadTexture('../images/firefly.png');
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.particleGroup = new ShaderParticleGroup({
      texture: texture,
      maxAge: 3
    });
    
    this.initializePaint();
    
    var brush = new Vizi.Object;
    var visual = new Vizi.Visual({object:this.particleGroup.mesh});
    brush.addComponent(visual);
    this._object.addChild(brush);
}

FirefliesScript.prototype.initializePaint = function() {
	
	var i, brushEmitter, _i, _ref, _results;

    for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      brushEmitter = new ShaderParticleEmitter({
          positionSpread: new THREE.Vector3(60, 20, 60),
          size: 10,
          sizeEnd: 10,
          colorEnd: new THREE.Color(),
          particlesPerSecond: 100,
          opacityStart: 0.5,
          opacityMiddle: 1,
          opacityEnd: 0.5,
          velocitySpread: new THREE.Vector3(5, 5, 5),
          accelerationSpread: new THREE.Vector3(2, 2, 2)
      });
      this.particleGroup.addEmitter(brushEmitter);
      this.brushEmitters.push(brushEmitter);
      brushEmitter.disable();
    }
}

FirefliesScript.prototype.startPaint = function() {

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
			brushEmitter.enable();
		}
	}	

	this.paintTimeout = setTimeout(function() {
		return _this.startPaint();
		}, 
		this.paintTimeoutInterval);
}

FirefliesScript.prototype.endPaint = function() {
    return window.clearTimeout(this.paintTimeout);
}

FirefliesScript.prototype.update = function() {
    return this.particleGroup.tick();
}
