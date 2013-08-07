/**
 * @fileoverview Object collects a group of Components that define an object and its behaviors
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Object');
goog.require('Vizi.EventDispatcher');

/**
 * Creates a new Object.
 * @constructor
 * @extends {Vizi.EventDispatcher}
 */
Vizi.Object = function() {
    Vizi.EventDispatcher.call(this);
    
    /**
     * @type {number}
     * @private
     */
    this._id = Vizi.Object.nextId++;

    /**
     * @type {Vizi.Object}
     * @private
     */
    this._parent = null;

    /**
     * @type {Array.<Vizi.Object>}
     * @private
     */
    this._children = [];

    /**
     * @type {Array}
     * @private
     */
    this._components = [];
    
    
    /**
     * @type {Boolean}
     * @private
     */
    this._realized = false;
}

goog.inherits(Vizi.Object, Vizi.EventDispatcher);

/**
 * The next identifier to hand out.
 * @type {number}
 * @private
 */
Vizi.Object.nextId = 0;

Vizi.Object.prototype.getID = function() {
    return this._id;
}

//---------------------------------------------------------------------
// Hierarchy methods
//---------------------------------------------------------------------

/**
 * Sets the parent of the Object.
 * @param {Vizi.Object} parent The parent of the Object.
 * @private
 */
Vizi.Object.prototype.setParent = function(parent) {
    this._parent = parent;
}

/**
 * Adds a child to the Object.
 * @param {Vizi.Object} child The child to add.
 */
Vizi.Object.prototype.addChild = function(child) {
    if (!child)
    {
        throw new Error('Cannot add a null child');
    }

    if (child._parent)
    {
        throw new Error('Child is already attached to an Object');
    }

    child.setParent(this);
    this._children.push(child);

    if (this._realized && !child._realized)
    {
    	child.realize();
    }

}

/**
 * Removes a child from the Object
 * @param {Vizi.Object} child The child to remove.
 */
Vizi.Object.prototype.removeChild = function(child) {
    var i = this._children.indexOf(child);

    if (i != -1)
    {
        this._children.splice(i, 1);
        child.setParent(null);
    }
}

/**
 * Removes a child from the Object
 * @param {Vizi.Object} child The child to remove.
 */
Vizi.Object.prototype.getChild = function(index) {
	if (index >= this._children.length)
		return null;
	
	return this._children[index];
}

//---------------------------------------------------------------------
// Component methods
//---------------------------------------------------------------------

/**
 * Adds a Component to the Object.
 * @param {Vizi.Component} component.
 */
Vizi.Object.prototype.addComponent = function(component) {
    if (!component)
    {
        throw new Error('Cannot add a null component');
    }
    
    if (component._object)
    {
        throw new Error('Component is already attached to an Object')
    }

    var proto = Object.getPrototypeOf(component);
    if (proto._componentProperty)
    {
    	if (this[proto._componentProperty])
    	{
    		var t = proto._componentPropertyType;
            Vizi.System.warn('Object already has a ' + t + ' component');
            return;
    	}
    	
    	this[proto._componentProperty] = component;
    }

    this._components.push(component);
    component.setObject(this);
    
    if (this._realized && !component._realized)
    {
    	component.realize();
    }
}

/**
 * Removes a Component from the Object.
 * @param {Vizi.Component} component.
 */
Vizi.Object.prototype.removeComponent = function(component) {
    var i = this._components.indexOf(component);

    if (i != -1)
    {
    	if (component.removeFromScene)
    	{
    		component.removeFromScene();
    	}
    	
        this._components.splice(i, 1);
        component.setObject(null);
    }
}

/**
 * Retrieves a Component of a given type in the Object.
 * @param {Object} type.
 */
Vizi.Object.prototype.getComponent = function(type) {
	var i, len = this._components.length;
	
	for (i = 0; i < len; i++)
	{
		var component = this._components[i];
		if (component instanceof type)
		{
			return component;
		}
	}
	
	return null;
}

/**
 * Retrieves a Component of a given type in the Object.
 * @param {Object} type.
 */
Vizi.Object.prototype.getComponents = function(type) {
	var i, len = this._components.length;
	
	var components = [];
	
	for (i = 0; i < len; i++)
	{
		var component = this._components[i];
		if (component instanceof type)
		{
			components.push(component);
		}
	}
	
	return components;
}

//---------------------------------------------------------------------
//Initialize methods
//---------------------------------------------------------------------

Vizi.Object.prototype.realize = function() {
    this.realizeComponents();
    this.realizeChildren();
        
    this._realized = true;
}

/**
 * @private
 */
Vizi.Object.prototype.realizeComponents = function() {
    var component;
    var count = this._components.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._components[i].realize();
    }
}

/**
 * @private
 */
Vizi.Object.prototype.realizeChildren = function() {
    var child;
    var count = this._children.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._children[i].realize();
    }
}

//---------------------------------------------------------------------
// Update methods
//---------------------------------------------------------------------

Vizi.Object.prototype.update = function() {
    this.updateComponents();
    this.updateChildren();
}

/**
 * @private
 */
Vizi.Object.prototype.updateComponents = function() {
    var component;
    var count = this._components.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._components[i].update();
    }
}

/**
 * @private
 */
Vizi.Object.prototype.updateChildren = function() {
    var child;
    var count = this._children.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._children[i].update();
    }
}
