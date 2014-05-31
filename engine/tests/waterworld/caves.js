CavesPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var cavesScript = new CavesScript();
	obj.addComponent(cavesScript);
	
	return obj;
}

goog.provide('CavesScript');
goog.require('Vizi.Script');

CavesScript = function(param) {
	Vizi.Script.call(this, param);

}

goog.inherits(CavesScript, Vizi.Script);

CavesScript.prototype.realize = function()
{
    var i, parameters, position, terrain, terrainGeo, terrainMaterial, terrainMesh, _i, _ref;
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
      depth: 300,
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
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide
      });
      terrainGeo.computeVertexNormals();
      terrain = new Vizi.Object;
      terrainMesh = new THREE.Mesh(terrainGeo, terrainMaterial);
      var visual = new Vizi.Visual({object:terrainMesh});
      terrain.addComponent(visual);
      position = new THREE.Vector3(rnd(-WaterWorld.EXTENT / this.caveSpreadFactor, WaterWorld.EXTENT / this.caveSpreadFactor), -2, 
    		  rnd(-WaterWorld.EXTENT / this.caveSpreadFactor, WaterWorld.EXTENT / this.caveSpreadFactor));
      terrain.transform.position.copy(position);
      this.positions.push(position);
      this._object.addChild(terrain);
    }
}

CavesScript.prototype.update = function() {
}

