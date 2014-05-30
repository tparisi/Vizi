MeteorsPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

    var i, _i;
    this.calcTimeout = 5000;

    var meteorGroup = new ShaderParticleGroup({
      texture: THREE.ImageUtils.loadTexture('../images/star.png'),
      blending: THREE.AdditiveBlending,
      maxAge: 3
    });
    
    var visual = new Vizi.Visual({object:meteorGroup.mesh});
    obj.addComponent(visual);
    
    var meteorsScript = new MeteorsScript({
    	meteorGroup : meteorGroup,
    	meteorVisibleDistance : 100000,
    	meteorsObject: obj,
    });
    
    obj.addComponent(meteorsScript);
    return obj;
}

goog.provide('MeteorsScript');
goog.require('Vizi.Script');

MeteorsScript = function(param) {
	Vizi.Script.call(this, param);

    this.meteors = [];
    this.meteorGroup = param.meteorGroup;
    this.meteorsObject = param.meteorsObject;
    this.meteorVisibleDistance = param.meteorVisibleDistance;
}

goog.inherits(MeteorsScript, Vizi.Script);

MeteorsScript.prototype.realize = function()
{
    for (i = _i = 1; _i <= 6; i = ++_i) {
        this.newMeteor();
      }

    this.calcPositions(); 
}


MeteorsScript.prototype.newMeteor = function() {
    var colorEnd, colorStart, meteor;
    colorStart = new THREE.Color();
    colorStart.setRGB(Math.random(), Math.random(), Math.random());
    meteor = new Vizi.Object;
    this.resetMeteor(meteor);
    colorEnd = new THREE.Color();
    colorEnd.setRGB(Math.random(), Math.random(), Math.random());
    var pl = new THREE.PointLight(colorStart, 2, 1000);
    var pointLight = new Vizi.PointLight({object:pl});
    meteor.addComponent(pointLight);
    this.meteorsObject.addChild(meteor);
    
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
}

MeteorsScript.prototype.resetMeteor = function(meteor) {
    meteor.speedX = rnd(0.01, 3);
    meteor.speedZ = rnd(0.01, 3);
    meteor.speedY = 0;
    meteor.accelX = rnd(.001, .2);
    meteor.accelZ = rnd(.001, .2);
    meteor.accelY = rnd(-0.005, 0.005);
    meteor.dirX = rnd(-1, 1);
    meteor.dirY = -1;
    meteor.dirZ = rnd(1, -1);
    meteor.transform.position.set(rnd(-30000, 30000), rnd(2000, 7000), rnd(-30000, 30000));
}

MeteorsScript.prototype.calcPositions = function() {
    var distance, meteor, _i, _len, _ref,
      _this = this;
    _ref = this.meteors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      meteor = _ref[_i];
      distance = Vizi.Graphics.instance.camera.position.distanceTo(meteor.transform.position);
      if (distance > this.meteorVisibleDistance + rnd(-this.meteorVisibleDistance / 2, this.meteorVisibleDistance / 2)) {
        this.resetMeteor(meteor);
      }
    }
    return setTimeout(function() {
      return _this.calcPositions();
    }, this.calcTimeout);
}
MeteorsScript.prototype.update = function()
{

    var meteor, _i, _len, _ref;
    _ref = this.meteors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      meteor = _ref[_i];
      meteor.speedX += meteor.accelX;
      meteor.speedY += meteor.accelY;
      meteor.speedZ += meteor.accelZ;
      meteor.transform.object.translateX(meteor.speedX * meteor.dirX);
      meteor.transform.object.translateY(meteor.speedY * meteor.dirY);
      meteor.transform.object.translateZ(meteor.speedZ * meteor.dirZ);
      meteor.light.object.position.copy(meteor.transform.position);
      meteor.tailEmitter.position = new THREE.Vector3().copy(meteor.transform.position);
    }
    return this.meteorGroup.tick();
}
