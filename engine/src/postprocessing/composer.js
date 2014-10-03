/**
 * @fileoverview Vizi Effects Composer - postprocessing effects composer, wraps Three.js
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Composer');

/**
 * @constructor
 */

Vizi.Composer = function(param)
{
	// Freak out if somebody tries to make 2
    if (Vizi.Composer.instance)
    {
        throw new Error('Composer singleton already exists')
    }

	Vizi.Composer.instance = this;

    // Create the effects composer
    // For now, create default render pass to start it up
	var graphics = Vizi.Graphics.instance;
	graphics.renderer.autoClear = false;
    this.composer = new THREE.EffectComposer( graphics.riftCam ? graphics.riftCam : graphics.renderer );
    var bgPass = new THREE.RenderPass( graphics.backgroundLayer.scene, graphics.backgroundLayer.camera );
    bgPass.clear = true;
	this.composer.addPass( bgPass );
	var fgPass = new THREE.RenderPass( graphics.scene, graphics.camera );
	fgPass.clear = false;
	this.composer.addPass(fgPass);
	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;
	this.composer.addPass(copyPass);
}

Vizi.Composer.prototype.render = function(deltat) {

	// for now just pass it through
	this.composer.render(deltat);	
}

Vizi.Composer.prototype.addEffect = function(effect) {

	var index = this.composer.passes.length - 1;
	this.composer.insertPass(effect.pass, index);	
}

Vizi.Composer.prototype.setCamera = function(camera) {
	var renderpass = this.composer.passes[1];
	renderpass.camera = camera;
}

Vizi.Composer.prototype.setSize = function(width, height) {
	this.composer.setSize(width, height);
}

Vizi.Composer.instance = null;