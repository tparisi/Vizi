/**
 * @fileoverview Object collects a group of Components that define an object and its behaviors
 * 
 * @author Tony Parisi
 */


goog.require('Vizi.Prefabs');

Vizi.Prefabs.Skybox = function(param)
{
	param = param || {};
	
	var box = new Vizi.Object({layer:Vizi.Graphics.instance.backgroundLayer});

	var textureCube = null;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide

	} );

	var visual = new Vizi.Visual(
			{ geometry: new THREE.BoxGeometry( 10000, 10000, 10000 ),
				material: material,
			});
	box.addComponent(visual);
	
	var script = new Vizi.SkyboxScript(param);
	box.addComponent(script);
	
	box.realize();

	return box;
}

goog.provide('Vizi.SkyboxScript');
goog.require('Vizi.Script');

Vizi.SkyboxScript = function(param)
{
	Vizi.Script.call(this, param);

	this.maincampos = new THREE.Vector3; 
	this.maincamrot = new THREE.Quaternion; 
	this.maincamscale = new THREE.Vector3; 
	
    Object.defineProperties(this, {
    	texture: {
			get : function() {
				return this.uniforms[ "tCube" ].value;
			},
			set: function(texture) {
				this.uniforms[ "tCube" ].value = texture;
			}
		},
    });
}

goog.inherits(Vizi.SkyboxScript, Vizi.Script);

Vizi.SkyboxScript.prototype.realize = function()
{
	var visual = this._object.getComponent(Vizi.Visual);
	this.uniforms = visual.material.uniforms;

	this.camera = Vizi.Graphics.instance.backgroundLayer.camera;
	this.camera.far = 20000;
	this.camera.position.set(0, 0, 0);
}

Vizi.SkyboxScript.prototype.update = function()
{
	var maincam = Vizi.Graphics.instance.camera;
	maincam.updateMatrixWorld();
	maincam.matrixWorld.decompose(this.maincampos, this.maincamrot, this.maincamscale);
	this.camera.quaternion.copy(this.maincamrot);
}

