(function() {
  var Mystery;

  FW.Mystery = Mystery = (function() {
    function Mystery() {
      var texture;
      this.name = 'mystery';
      this.numEmitters = 20000;
      this.emitterActivateFraction = 1 / this.numEmitters;
      this.spellEmitters = [];
      this.height = 220;
      this.distanceFromPlayer = 50;
      this.castingTimeoutInterval = 50;
      this.startingPos = new THREE.Vector3(0, 0, 0);
      this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      texture = THREE.ImageUtils.loadTexture('assets/smokeparticle.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.spellGroup = new ShaderParticleGroup({
        texture: texture,
        maxAge: 20
      });
      this.initializeSpells();
      FW.scene.add(this.spellGroup.mesh);
    }

    Mystery.prototype.initializeSpells = function() {
      var colorStart, i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        colorStart = new THREE.Color();
        colorStart.setRGB(1.0, 0, 0);
        spellEmitter = new ShaderParticleEmitter({
          size: 10,
          sizeEnd: 100000,
          colorStart: colorStart,
          particlesPerSecond: 1,
          opacityStart: 0.2,
          opacityMiddle: 1,
          opacityEnd: 1
        });
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Mystery.prototype.castSpell = function() {
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
          spellEmitter.position.y = Math.max(5, spellEmitter.position.y);
          spellEmitter.enable();
          FW.spellsToUndo.push(spellEmitter);
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Mystery.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Mystery.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Mystery;

  })();

}).call(this);
