/**
 * @fileoverview Object collects a group of Components that define an object and its behaviors
 * 
 * @author Tony Parisi
 */


goog.require('Vizi.Prefabs');

Vizi.Prefabs.Skysphere = function(param)
{
	param = param || {};
	
	var sphere = new Vizi.Object({layer:Vizi.Graphics.instance.backgroundLayer});

	var material = new THREE.MeshBasicMaterial( {
		color:0xffffff,
//		side: THREE.BackSide

	} );

	var geometry = new THREE.SphereGeometry( 500, 32, 32 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
	var visual = new Vizi.Visual(
			{ geometry: geometry,
				material: material,
			});
	sphere.addComponent(visual);
	
	var script = new Vizi.SkysphereScript(param);
	sphere.addComponent(script);
	
	sphere.realize();

	return sphere;
}

goog.provide('Vizi.SkysphereScript');
goog.require('Vizi.Script');

Vizi.SkysphereScript = function(param)
{
	Vizi.Script.call(this, param);

	this.maincampos = new THREE.Vector3; 
	this.maincamrot = new THREE.Quaternion; 
	this.maincamscale = new THREE.Vector3; 
	
    Object.defineProperties(this, {
    	texture: {
			get : function() {
				return this.material.map;
			},
			set: function(texture) {
				this.material.map = texture;
			}
		},
    });
}

goog.inherits(Vizi.SkysphereScript, Vizi.Script);

Vizi.SkysphereScript.prototype.realize = function()
{
	var visual = this._object.getComponent(Vizi.Visual);
	this.material = visual.material;

	this.camera = Vizi.Graphics.instance.backgroundLayer.camera;
	this.camera.far = 20000;
	this.camera.position.set(0, 0, 0);
}

Vizi.SkysphereScript.prototype.update = function()
{
	var maincam = Vizi.Graphics.instance.camera;
	maincam.updateMatrixWorld();
	maincam.matrixWorld.decompose(this.maincampos, this.maincamrot, this.maincamscale);
	this.camera.quaternion.copy(this.maincamrot);
}

