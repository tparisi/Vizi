(function() {
  var Fire;

  FW.Fire = Fire = (function() {
    function Fire() {
      var texture;
      this.name = 'fire';
      this.numEmitters = 200;
      this.emitterActivateFraction = 1 / this.numEmitters;
      this.spellEmitters = [];
      this.distanceFromPlayer = 50;
      this.castingTimeoutInterval = 50;
      this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      texture = THREE.ImageUtils.loadTexture('assets/smokeparticle.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.spellGroup = new ShaderParticleGroup({
        texture: texture,
        maxAge: 2
      });
      this.initializeSpells();
      FW.scene.add(this.spellGroup.mesh);
    }

    Fire.prototype.initializeSpells = function() {
      var colorEnd, colorStart, i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        colorStart = new THREE.Color();
        colorStart.setHSL(rnd(0.55, 0.65), .3, .3);
        colorEnd = new THREE.Color();
        colorEnd.setHSL(rnd(0, .1), 0.8, 0.3);
        spellEmitter = new ShaderParticleEmitter({
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
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Fire.prototype.castSpell = function() {
      var direction, spellEmitter, _i, _len, _ref,
        _this = this;
      this.fakeObject.position.copy(FW.controls.getPosition());
      direction = FW.controls.getDirection();
      this.fakeObject.translateZ(direction.z * this.distanceFromPlayer);
      this.fakeObject.translateY(direction.y * this.distanceFromPlayer);
      this.fakeObject.translateX(direction.x * this.distanceFromPlayer);
      _ref = this.spellEmitters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spellEmitter = _ref[_i];
        if (Math.random() < this.emitterActivateFraction) {
          spellEmitter.position.copy(this.fakeObject.position);
          spellEmitter.position.y = Math.max(0, spellEmitter.position.y - 50);
          spellEmitter.enable();
          FW.spellsToUndo.push(spellEmitter);
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Fire.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Fire.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Fire;

  })();

}).call(this);
