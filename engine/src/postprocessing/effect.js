/**
 * @fileoverview Effect - Vizi postprocessing effect, wraps Three.js
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Effect');
goog.require('Vizi.EventDispatcher');

/**
 * @constructor
 */

Vizi.Effect = function(shader)
{
    Vizi.EventDispatcher.call(this);	
    
	this.isShaderEffect = false;

    if (shader.render && typeof(shader.render) == "function") {
    	this.pass = shader;
    }
    else {
    	this.pass = new THREE.ShaderPass(shader);
    	this.isShaderEffect = true;
    }
}

goog.inherits(Vizi.Effect, Vizi.EventDispatcher);

Vizi.Effect.prototype.update = function() {

	// hook for later - maybe we do
	// subclass with specific knowledge about shader uniforms
}

