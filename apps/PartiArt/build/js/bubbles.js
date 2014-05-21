(function() {
  var Bubbles;

  FW.Bubbles = Bubbles = (function() {
    function Bubbles() {
      var texture;
      this.name = 'bubbles';
      this.riseSpeed = .05;
      this.numEmitters = 100;
      this.emitterActivateFraction = 1 / this.numEmitters;
      this.spellEmitters = [];
      this.height = 220;
      this.distanceFromPlayer = 30;
      this.castingTimeoutInterval = 500;
      this.startingPos = new THREE.Vector3(0, 0, 0);
      this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      texture = THREE.ImageUtils.loadTexture('assets/bubbles.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.spellGroup = new ShaderParticleGroup({
        texture: texture,
        maxAge: 2
      });
      this.initializeSpells();
      FW.scene.add(this.spellGroup.mesh);
    }

    Bubbles.prototype.initializeSpells = function() {
      var colorEnd, colorStart, i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        colorStart = new THREE.Color();
        colorStart.setRGB(Math.random(), Math.random(), Math.random());
        colorEnd = new THREE.Color();
        colorEnd.setRGB(Math.random(), Math.random(), Math.random());
        spellEmitter = new ShaderParticleEmitter({
          positionSpread: new THREE.Vector3(1, 1, 1),
          sizeEnd: 5,
          colorStart: colorStart,
          colorEnd: colorEnd,
          particlesPerSecond: 50,
          opacityStart: 0.5,
          opacityMiddle: 1,
          opacityEnd: 0,
          accelerationSpread: new THREE.Vector3(2, 2, 2)
        });
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Bubbles.prototype.castSpell = function() {
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
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Bubbles.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Bubbles.prototype.update = function() {
      var spellEmitter, _i, _len, _ref, _results;
      this.spellGroup.tick();
      _ref = this.spellEmitters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spellEmitter = _ref[_i];
        _results.push(spellEmitter.position.y += this.riseSpeed);
      }
      return _results;
    };

    return Bubbles;

  })();

}).call(this);
