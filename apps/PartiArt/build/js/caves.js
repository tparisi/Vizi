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
