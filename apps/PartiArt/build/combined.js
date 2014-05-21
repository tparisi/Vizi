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

(function() {
  var Caves;

  FW.Caves = Caves = (function() {
    function Caves() {
      var i, parameters, position, terrain, terrainGeo, terrainMaterial, _i, _ref;
      this.numCaves = 5;
      this.positions = [];
      this.caveSpreadFactor = 50;
      parameters = {
        alea: RAND_MT,
        generator: PN_GENERATOR,
        width: 300,
        height: 300,
        widthSegments: 30,
        heightSegments: 30,
        depth: 200,
        param: 4,
        filterparam: 1,
        filter: [CIRCLE_FILTER],
        postgen: [MOUNTAINS_COLORS],
        effect: [DESTRUCTURE_EFFECT]
      };
      for (i = _i = 1, _ref = this.numCaves; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        terrainGeo = TERRAINGEN.Get(parameters);
        terrainMaterial = new THREE.MeshPhongMaterial({
          vertexColors: THREE.VertexColors,
          shading: THREE.FlatShading,
          side: THREE.DoubleSide
        });
        terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
        position = new THREE.Vector3(rnd(-FW.width / this.caveSpreadFactor, FW.width / this.caveSpreadFactor), -2, rnd(-FW.width / this.caveSpreadFactor, FW.width / this.caveSpreadFactor));
        terrain.position = position;
        this.positions.push(position);
        FW.scene.add(terrain);
      }
    }

    return Caves;

  })();

}).call(this);

(function() {
  var Controls;

  FW.Controls = Controls = (function() {
    function Controls() {
      FW.controls = new THREE.PointerLockControls(FW.camera);
      document.addEventListener('click', function(event) {
        var element, havePointerLock, pointerLockChange,
          _this = this;
        havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
        if (havePointerLock) {
          element = document.body;
          pointerLockChange = function(event) {
            if (document.pointerLockElement = element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
              return FW.controls.enabled = true;
            }
          };
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
          element.requestPointerLock();
        }
        document.addEventListener('pointerlockchange', function() {
          pointerLockChange();
          return false;
        });
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        return document.addEventListener('webkitpointerlockchange', function() {
          pointerLockChange();
          return false;
        });
      });
    }

    Controls.prototype.update = function() {
      return this.controls.update();
    };

    return Controls;

  })();

}).call(this);

(function() {
  var DougsShit;

  FW.DougsShit = DougsShit = (function() {
    function DougsShit(position) {
      this.position = position;
      this.dougsCrazyShit = [];
      this.startRotationSpeed = .02;
      this.endRotationSpeed = .005;
      this.zRotationStart = 0;
      this.zRotationEnd = 2 * Math.PI;
      this.startRadius = 5;
      this.endRadius = 50;
      this.numLayers = 40;
      this.startSegments = 20;
      this.endSegments = 50;
      this.width = 1;
      this.height = 1;
      this.squareGeo = new THREE.PlaneGeometry(1, 1);
      this.materials = [];
      this.placeNodes();
    }

    DougsShit.prototype.placeNodes = function() {
      var geoLayer, i, layer, layerMesh, _i, _ref, _results;
      _results = [];
      for (i = _i = 1, _ref = this.numLayers; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        this.radius = map(i, 1, this.numLayers, this.startRadius, this.endRadius);
        this.numSegments = Math.floor(map(i, 1, this.numLayers, this.startSegments, this.endSegments));
        geoLayer = new THREE.CircleGeometry(this.radius, this.numSegments);
        layerMesh = new THREE.ParticleSystem(geoLayer);
        layerMesh.position = this.position;
        FW.scene.add(layerMesh);
        layer = {
          mesh: layerMesh,
          rotationSpeed: map(i, 1, this.numLayers, this.startRotationSpeed, this.endRotationSpeed)
        };
        _results.push(this.dougsCrazyShit.push(layer));
      }
      return _results;
    };

    DougsShit.prototype.update = function() {
      var layer, _i, _len, _ref, _results;
      _ref = this.dougsCrazyShit;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        _results.push(layer.mesh.rotation.z += layer.rotationSpeed);
      }
      return _results;
    };

    return DougsShit;

  })();

}).call(this);

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

(function() {
  var Main;

  window.$ = document.querySelectorAll.bind(document);

  Element.prototype.on = Element.prototype.addEventListener;

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  window.FW = {};

  if (typeof SC !== "undefined" && SC !== null) {
    SC.initialize({
      client_id: "7da24ca214bf72b66ed2494117d05480"
    });
  }

  FW.sfxVolume = 0.2;

  FW.globalTick = 0.16;

  window.soundOn = false;

  window.onload = function() {
    var infoEl, infoShowing;
    FW.myWorld = new FW.World();
    FW.myWorld.animate();
    FW.main = new FW.Main();
    infoEl = document.getElementsByClassName('infoWrapper')[0];
    infoShowing = false;
    return document.onclick = function(event) {
      var el;
      el = event.target;
      if (el.className === "icon") {
        infoEl.style.display = infoShowing ? 'none' : 'block';
        return infoShowing = !infoShowing;
      }
    };
  };

  FW.Main = Main = (function() {
    function Main() {
      if (soundOn) {
        SC.stream("/tracks/rameses-b-inspire", function(sound) {
          if (soundOn) {
            return sound.play();
          }
        });
      }
    }

    return Main;

  })();

}).call(this);

(function() {
  var Meteors;

  FW.Meteors = Meteors = (function() {
    function Meteors() {
      var i, _i;
      this.calcTimeout = 5000;
      this.meteors = [];
      this.meteorGroup = new ShaderParticleGroup({
        texture: THREE.ImageUtils.loadTexture('assets/star.png'),
        blending: THREE.AdditiveBlending,
        maxAge: 3
      });
      this.meteorVisibleDistance = 100000;
      for (i = _i = 1; _i <= 6; i = ++_i) {
        this.newMeteor();
      }
      FW.scene.add(this.meteorGroup.mesh);
      this.calcPositions();
    }

    Meteors.prototype.resetMeteor = function(meteor) {
      meteor.speedX = rnd(0.01, 3);
      meteor.speedZ = rnd(0.01, 3);
      meteor.speedY = 0;
      meteor.accelX = rnd(.001, .2);
      meteor.accelZ = rnd(.001, .2);
      meteor.accelY = rnd(-0.005, 0.005);
      meteor.dirX = rnd(-1, 1);
      meteor.dirY = -1;
      meteor.dirZ = rnd(1, -1);
      return meteor.position = new THREE.Vector3(rnd(-30000, 30000), rnd(2000, 7000), rnd(-30000, 30000));
    };

    Meteors.prototype.newMeteor = function() {
      var colorEnd, colorStart, meteor;
      colorStart = new THREE.Color();
      colorStart.setRGB(Math.random(), Math.random(), Math.random());
      meteor = new THREE.Object3D();
      this.resetMeteor(meteor);
      colorEnd = new THREE.Color();
      colorEnd.setRGB(Math.random(), Math.random(), Math.random());
      meteor.light = new THREE.PointLight(colorStart, 2, 1000);
      FW.scene.add(meteor.light);
      meteor.tailEmitter = new ShaderParticleEmitter({
        position: meteor.position,
        positionSpread: new THREE.Vector3(20, 20, 2),
        size: rnd(100, 1000),
        sizeSpread: 500,
        acceleration: new THREE.Vector3(meteor.dirX * .1, meteor.dirY * .1, meteor.dirZ * .1),
        accelerationSpread: new THREE.Vector3(.7, .7, .7),
        particlesPerSecond: 100,
        colorStart: colorStart,
        colorEnd: colorEnd
      });
      this.meteorGroup.addEmitter(meteor.tailEmitter);
      return this.meteors.push(meteor);
    };

    Meteors.prototype.calcPositions = function() {
      var distance, meteor, _i, _len, _ref,
        _this = this;
      _ref = this.meteors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        meteor = _ref[_i];
        distance = FW.controls.getPosition().distanceTo(meteor.position);
        if (distance > this.meteorVisibleDistance + rnd(-this.meteorVisibleDistance / 2, this.meteorVisibleDistance / 2)) {
          this.resetMeteor(meteor);
        }
      }
      return setTimeout(function() {
        return _this.calcPositions();
      }, this.calcTimeout);
    };

    Meteors.prototype.update = function() {
      var meteor, _i, _len, _ref;
      _ref = this.meteors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        meteor = _ref[_i];
        meteor.speedX += meteor.accelX;
        meteor.speedY += meteor.accelY;
        meteor.speedZ += meteor.accelZ;
        meteor.translateX(meteor.speedX * meteor.dirX);
        meteor.translateY(meteor.speedY * meteor.dirY);
        meteor.translateZ(meteor.speedZ * meteor.dirZ);
        meteor.light.position = new THREE.Vector3().copy(meteor.position);
        meteor.tailEmitter.position = new THREE.Vector3().copy(meteor.position);
      }
      return this.meteorGroup.tick();
    };

    return Meteors;

  })();

}).call(this);

(function() {
  var Spells;

  FW.Spells = Spells = (function() {
    function Spells() {
      var _this = this;
      this.spells = [];
      this.activeSpellIndex = 0;
      this.spells.push(new FW.Wand());
      this.spells.push(new FW.Fire());
      this.spells.push(new FW.Bubbles());
      this.spells.push(new FW.Fireflies());
      FW.spellsToUndo = [];
      FW.spellsToRedo = [];
      $('body')[0].on('mousedown', function(event) {
        return _this.spells[_this.activeSpellIndex].castSpell();
      });
      $('body')[0].on('mouseup', function() {
        return _this.spells[_this.activeSpellIndex].endSpell();
      });
      $('body')[0].on('keydown', this.handleHistory);
    }

    Spells.prototype.handleHistory = function(event) {
      var spellEmitter;
      if (event.keyCode === 90) {
        if (FW.spellsToUndo.length > 0) {
          spellEmitter = FW.spellsToUndo.pop();
          spellEmitter.disable();
          FW.spellsToRedo.push(spellEmitter);
        }
      }
      if (event.keyCode === 88) {
        if (FW.spellsToRedo.length > 0) {
          spellEmitter = FW.spellsToRedo.pop();
          spellEmitter.enable();
          return FW.spellsToUndo.push(spellEmitter);
        }
      }
    };

    Spells.prototype.update = function() {
      var spell, _i, _len, _ref, _results;
      _ref = this.spells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spell = _ref[_i];
        _results.push(spell.update());
      }
      return _results;
    };

    Spells.prototype.nextSpell = function() {
      var element, elements, _i, _len, _results;
      this.spells[this.activeSpellIndex].endSpell();
      this.activeSpellIndex++;
      if (this.activeSpellIndex === this.spells.length) {
        this.activeSpellIndex = 0;
      }
      elements = document.getElementsByClassName('spell');
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        if (element.id === this.spells[this.activeSpellIndex].name) {
          _results.push(element.className = 'spell show-class');
        } else {
          _results.push(element.className = 'spell hide-class');
        }
      }
      return _results;
    };

    return Spells;

  })();

}).call(this);

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
          console.log("SHNUUR");
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

(function() {
  var World,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FW.World = World = (function() {
    function World() {
      this.animate = __bind(this.animate, this);
      var aMeshMirror, mesh, waterNormals,
        _this = this;
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      FW.width = 100000;
      this.camFar = FW.width * 2;
      this.rippleFactor = 90;
      FW.camera = new THREE.PerspectiveCamera(50.0, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, this.camFar);
      FW.scene = new THREE.Scene();
      FW.Renderer = new THREE.WebGLRenderer();
      FW.Renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
      document.body.appendChild(FW.Renderer.domElement);
      mesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      mesh.position.z -= 200;
      waterNormals = new THREE.ImageUtils.loadTexture('./public/assets/waternormals.jpg');
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
      this.water = new THREE.Water(FW.Renderer, FW.camera, FW.scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 1.0,
        distortionScale: 20
      });
      aMeshMirror = new THREE.Mesh(new THREE.PlaneGeometry(FW.width, FW.width, 50, 50), this.water.material);
      aMeshMirror.add(this.water);
      aMeshMirror.rotation.x = -Math.PI * 0.5;
      aMeshMirror.position.z = -300;
      window.addEventListener("resize", (function() {
        return _this.onWindowResize();
      }), false);
    }

    World.prototype.onWindowResize = function(event) {
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      FW.Renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
      FW.camera.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      return FW.camera.updateProjectionMatrix();
    };

    World.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      return this.render();
    };

    World.prototype.render = function() {
      return FW.Renderer.render(FW.scene, FW.camera);
    };

    return World;

  })();

}).call(this);

(function() {
  var Wormhole;

  FW.Wormhole = Wormhole = (function() {
    function Wormhole() {
      var texture;
      this.name = 'wormhole';
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

    Wormhole.prototype.initializeSpells = function() {
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

    Wormhole.prototype.castSpell = function() {
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
        }
      }
      return this.castingTimeout = setTimeout(function() {
        return _this.castSpell();
      }, this.castingTimeoutInterval);
    };

    Wormhole.prototype.endSpell = function() {
      return window.clearTimeout(this.castingTimeout);
    };

    Wormhole.prototype.update = function() {
      return this.spellGroup.tick();
    };

    return Wormhole;

  })();

}).call(this);
