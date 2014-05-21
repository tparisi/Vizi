(function() {
  var Wand;

  FW.Wand = Wand = (function() {
    function Wand() {
      var texture;
      this.name = 'wand';
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
        maxAge: 5
      });
      this.initializeSpells();
      FW.scene.add(this.spellGroup.mesh);
    }

    Wand.prototype.initializeSpells = function() {
      var colorEnd, colorStart, i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        colorStart = new THREE.Color();
        colorStart.setRGB(Math.random(), Math.random(), Math.random());
        colorEnd = new THREE.Color();
        colorEnd.setRGB(Math.random(), Math.random(), Math.random());
        spellEmitter = new ShaderParticleEmitter({
          size: 20,
          sizeEnd: 10,
          colorStart: colorStart,
          colorEnd: colorEnd,
          particlesPerSecond: 1,
          opacityStart: 0.2,
          opacityMiddle: 1,
          opacityEnd: 0
        });
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Wand.prototype.castSpell = function() {
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

    Wand.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Wand.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Wand;

  })();

}).call(this);
