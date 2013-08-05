/**
 * @author Tony Parisi
 */
goog.provide('Vizi.Service');

/**
 * Interface for a Service.
 *
 * Allows multiple different backends for the same type of service.
 * @interface
 */
Vizi.Service = function() {};

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the Service - Abstract.
 */
Vizi.Service.prototype.initialize = function(param) {};

/**
 * Terminates the Service - Abstract.
 */
Vizi.Service.prototype.terminate = function() {};


/**
 * Updates the Service - Abstract.
 */
Vizi.Service.prototype.update = function() {};