(function() {
  var World,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FW.World = World = (function() {
    function World() {
      this.animate = __bind(this.animate, this);
      var aMeshMirror, light1, light2, waterNormals,
        _this = this;
      FW.clock = new THREE.Clock();
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      FW.width = 100000;
      this.camFar = FW.width * 2;
      this.time = Date.now();
      this.rippleFactor = 90;
      FW.camera = new THREE.PerspectiveCamera(75.0, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, this.camFar);
      FW.scene = new THREE.Scene();
      this.controls = new FW.Controls(FW.camera);
      FW.scene.add(FW.controls.getObject());
      FW.controls.fly = true;
      FW.Renderer = new THREE.WebGLRenderer();
      FW.Renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
      FW.Renderer.setClearColor(0x000000);
      document.body.appendChild(FW.Renderer.domElement);
      light1 = new THREE.DirectionalLight(0xffffff, 1.0);
      light1.position.set(1, 1, 1);
      FW.scene.add(light1);
      light2 = new THREE.DirectionalLight(0xffffff, 1.0);
      light2.position.set(0, -1, -1);
      FW.scene.add(light2);
      this.caves = new FW.Caves();
      this.meteors = new FW.Meteors();
      this.stars = new FW.Stars();
      FW.spells = new FW.Spells();
      this.dougsShit = new FW.DougsShit(this.caves.positions[0]);
      waterNormals = new THREE.ImageUtils.loadTexture('./assets/waternormals.jpg');
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
      FW.scene.add(aMeshMirror);
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
      this.water.material.uniforms.time.value += 1.0 / this.rippleFactor;
      FW.controls.update(Date.now() - this.time);
      this.stars.update();
      FW.spells.update();
      this.meteors.update();
      this.dougsShit.update();
      this.time = Date.now();
      return this.render();
    };

    World.prototype.render = function() {
      this.water.render();
      return FW.Renderer.render(FW.scene, FW.camera);
    };

    return World;

  })();

}).call(this);
