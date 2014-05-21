(function() {
  var Fireflies;

  FW.Fireflies = Fireflies = (function() {
    function Fireflies() {
      var texture;
      this.name = 'fireflies';
      this.wormholeSpeed = 1;
      this.riseSpeed = .1;
      this.numEmitters = 10;
      this.emitterActivateFraction = 1 / this.numEmitters;
      this.spellEmitters = [];
      this.height = 220;
      this.distanceFromPlayer = 70;
      this.castingTimeoutInterval = 1000;
      this.startingPos = new THREE.Vector3(0, 0, 0);
      this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
      texture = THREE.ImageUtils.loadTexture('assets/firefly.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.spellGroup = new ShaderParticleGroup({
        texture: texture,
        maxAge: 3
      });
      this.initializeSpells();
      FW.scene.add(this.spellGroup.mesh);
    }

    Fireflies.prototype.initializeSpells = function() {
      var i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        spellEmitter = new ShaderParticleEmitter({
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
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Fireflies.prototype.castSpell = function() {
      var spellEmitter, _i, _len, _ref,
        _this = this;
      this.fakeObject.position.copy(FW.controls.getPosition());
      this.direction = FW.controls.getDirection();
      this.fakeObject.translateZ(this.direction.z * this.distanceFromPlayer);
      this.fakeObject.translateY(this.direction.y * this.distanceFromPlayer);
      this.fakeObject.translateX(this.direction.x * this.distanceFromPlayer);
      _ref = this.spellEmitters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spellEmitter = _ref[_i];
        if (Math.random() < this.emitterActivateFraction) {
          spellEmitter.position.copy(this.fakeObject.position);
          spellEmitter.enable();
          FW.spellsToUndo.push(spellEmitter);
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Fireflies.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Fireflies.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Fireflies;

  })();

}).call(this);
