/**
 *
 */
goog.require('Vizi.Service');
goog.provide('Vizi.TweenService');

/**
 * The TweenService.
 *
 * @extends {Vizi.Service}
 */
Vizi.TweenService = function() {};

goog.inherits(Vizi.TweenService, Vizi.Service);

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the events system.
 */
Vizi.TweenService.prototype.initialize = function(param) {};

/**
 * Terminates the events world.
 */
Vizi.TweenService.prototype.terminate = function() {};


/**
 * Updates the TweenService.
 */
Vizi.TweenService.prototype.update = function()
{
	if (window.TWEEN)
		TWEEN.update();
}