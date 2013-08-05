/**
 * @fileoverview Component is the base class for defining capabilities used within an Object
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Component');
goog.require('Vizi.EventDispatcher');

/**
 * Creates a new Component.
 * @constructor
 */
Vizi.Component = function(param) {
    Vizi.EventDispatcher.call(this);
	
	param = param || {};
	this.param = param;
    
    /**
     * @type {Vizi.Object}
     * @private
     */
    this._object = null;
    
    /**
     * @type {Boolean}
     * @private
     */
    this._realized = false;
}

goog.inherits(Vizi.Component, Vizi.EventDispatcher);

/**
 * Gets the Object the Component is associated with.
 * @returns {Vizi.Object} The Object the Component is associated with.
 */
Vizi.Component.prototype.getObject = function() {
    return this._object;
}

/**
 * Sets the Object the Component is associated with.
 * @param {Vizi.Object} object
 */
Vizi.Component.prototype.setObject = function(object) {
    this._object = object;
}

Vizi.Component.prototype.realize = function() {
    this._realized = true;
}

Vizi.Component.prototype.update = function() {
    this.handleMessages();
}
