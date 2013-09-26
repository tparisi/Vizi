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
			{ geometry: new THREE.CubeGeometry( 1, 1, 1 ),
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
}

Vizi.SkyboxScript.prototype.update = function()
{
	var dir = Vizi.Graphics.instance.camera.position.clone()
		.negate().normalize(); // say that 3x fast
	
	Vizi.Graphics.instance.backgroundLayer.camera.position.set(0, 0, 0);
	Vizi.Graphics.instance.backgroundLayer.camera.lookAt(dir);
}

