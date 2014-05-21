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
