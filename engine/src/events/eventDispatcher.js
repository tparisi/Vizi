/**
 * @fileoverview EventDispatcher is the base class for any object that sends/receives messages
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.EventDispatcher');
goog.require('Vizi.EventService');
goog.require('Vizi.Time');

/**
 * @constructor
 */
Vizi.EventDispatcher = function() {
    this.eventTypes = {};
    this.timestamps = {};
}

Vizi.EventDispatcher.prototype.addEventListener = function(type, listener) {
    var listeners = this.eventTypes[type];
    if (listeners)
    {
        if (listeners.indexOf(listener) != -1)
        {
            return;
        }
    }
    else
    {
    	listeners = [];
        this.eventTypes[type] = listeners;
        this.timestamps[type] = 0;
    }

    listeners.push(listener);
}

Vizi.EventDispatcher.prototype.removeEventListener =  function(type, listener) {
    if (listener)
    {
        var listeners = this.eventTypes[type];

        if (listeners)
        {
            var i = listeners.indexOf(listener);
            if (i != -1)
            {
            	listeners.splice(i, 1);
            }
        }
    }
    else
    {
        delete this.eventTypes[type];
        delete this.timestamps[type];
    }
}

Vizi.EventDispatcher.prototype.dispatchEvent = function(type) {
    var listeners = this.eventTypes[type];

    if (listeners)
    {
    	var now = Vizi.Time.instance.currentTime;
    	
    	if (this.timestamps[type] < now)
    	{
    		this.timestamps[type] = now;
	    	Vizi.EventService.eventsPending = true;
	    	
	    	for (var i = 0; i < listeners.length; i++)
	        {
	    		[].shift.call(arguments);
                listeners[i].apply(this, arguments);
	        }
    	}
    }
}

Vizi.EventDispatcher.prototype.hasEventListener = function (subscribers, subscriber) {
    var listeners = this.eventTypes[type];
    if (listeners)
        return (listeners.indexOf(listener) != -1)
    else
    	return false;
}
