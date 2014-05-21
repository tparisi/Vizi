(function() {
  var Stars;

  FW.Stars = Stars = (function() {
    function Stars() {
      var texture;
      this.colorStart = new THREE.Color();
      this.colorStart.setRGB(Math.random(), Math.random(), Math.random());
      texture = THREE.ImageUtils.loadTexture('assets/star.png');
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.starGroup = new ShaderParticleGroup({
        texture: texture,
        blending: THREE.AdditiveBlending,
        maxAge: 10
      });
      this.generateStars();
      FW.scene.add(this.starGroup.mesh);
    }

    Stars.prototype.generateStars = function() {
      this.starEmitter = new ShaderParticleEmitter({
        type: 'sphere',
        radius: 50000,
        speed: .1,
        size: rnd(4000, 6000),
        sizeSpread: 4000,
        particlesPerSecond: rnd(500, 1100),
        opacityStart: 0,
        opacityMiddle: 1,
        opacityEnd: 0,
        colorStart: this.colorStart,
        colorSpread: new THREE.Vector3(rnd(.1, .5), rnd(.1, .5), rnd(.1, .5))
      });
      return this.starGroup.addEmitter(this.starEmitter);
    };

    Stars.prototype.update = function() {
      return this.starGroup.tick();
    };

    return Stars;

  })();

}).call(this);
