(function() {
  var Jelly;

  FW.Jelly = Jelly = (function() {
    function Jelly() {
      var texture,
        _this = this;
      this.numEmitters = 1000;
      this.emitterActivateFraction = 1 / this.numEmitters;
      this.spellEmitters = [];
      this.height = 220;
      this.distanceFromPlayer = 30;
      this.castingTimeoutInterval = 20;
      this.startingPos = new THREE.Vector3(0, 0, 0);
      this.fakeObject = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      texture = THREE.ImageUtils.loadTexture('assets/smokeparticle.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.spellGroup = new ShaderParticleGroup({
        texture: texture,
        maxAge: 3
      });
      this.initializeSpells();
      $('body')[0].on('mousedown', function(event) {
        return _this.castSpell();
      });
      $('body')[0].on('mouseup', function() {
        return _this.endSpell();
      });
      FW.scene.add(this.spellGroup.mesh);
    }

    Jelly.prototype.initializeSpells = function() {
      var color, i, spellEmitter, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.numEmitters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        color = new THREE.Color();
        color.setHSL(rnd(0, .2), 0.5, 0.5);
        spellEmitter = new ShaderParticleEmitter({
          colorStart: color,
          colorEnd: color,
          size: 40,
          sizeEnd: 20,
          particlesPerSecond: 1,
          opacityStart: 0.5,
          opacityMiddle: 1,
          opacityEnd: 0,
          acceleration: new THREE.Vector3(rnd(-1, 1), rnd(1, 5), rnd(-1, 1))
        });
        this.spellGroup.addEmitter(spellEmitter);
        this.spellEmitters.push(spellEmitter);
        _results.push(spellEmitter.disable());
      }
      return _results;
    };

    Jelly.prototype.castSpell = function() {
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
          spellEmitter.position.y = Math.max(0, spellEmitter.position.y);
          spellEmitter.enable();
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Jelly.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Jelly.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Jelly;

  })();

}).call(this);
