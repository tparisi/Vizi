/**
 *
 */
goog.require('Vizi.Service');
goog.provide('Vizi.AnimationService');

/**
 * The AnimationService.
 *
 * @extends {Vizi.Service}
 */
Vizi.AnimationService = function() {};

goog.inherits(Vizi.AnimationService, Vizi.Service);

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the events system.
 */
Vizi.AnimationService.prototype.initialize = function(param) {};

/**
 * Terminates the events world.
 */
Vizi.AnimationService.prototype.terminate = function() {};


/**
 * Updates the AnimationService.
 */
Vizi.AnimationService.prototype.update = function()
{
	if (window.TWEEN)
		THREE.glTFAnimator.update();
}