/**
 *
 */
goog.require('Vizi.Service');
goog.provide('Vizi.EventService');

/**
 * The EventService.
 *
 * @extends {Vizi.Service}
 */
Vizi.EventService = function() {};

goog.inherits(Vizi.EventService, Vizi.Service);

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the events system.
 */
Vizi.EventService.prototype.initialize = function(param) {};

/**
 * Terminates the events world.
 */
Vizi.EventService.prototype.terminate = function() {};


/**
 * Updates the EventService.
 */
Vizi.EventService.prototype.update = function()
{
	do
	{
		Vizi.EventService.eventsPending = false;
		Vizi.Application.instance.updateObjects();
	}
	while (Vizi.EventService.eventsPending);
}