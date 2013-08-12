
/**
 * @fileoverview Service locator for various game services.
 */
goog.provide('Vizi.Services');
goog.require('Vizi.Time');
goog.require('Vizi.Input');
goog.require('Vizi.TweenService');
goog.require('Vizi.EventService');
goog.require('Vizi.GraphicsThreeJS');

Vizi.Services = {};

Vizi.Services._serviceMap = 
{ 
		"time" : { object : Vizi.Time },
		"input" : { object : Vizi.Input },
		"tween" : { object : Vizi.TweenService },
		"events" : { object : Vizi.EventService },
		"graphics" : { object : Vizi.GraphicsThreeJS },
};

Vizi.Services.create = function(serviceName)
{
	var serviceType = Vizi.Services._serviceMap[serviceName];
	if (serviceType)
	{
		var prop = serviceType.property;
		
		if (Vizi.Services[serviceName])
		{
	        throw new Error('Cannot create two ' + serviceName + ' service instances');
		}
		else
		{
			if (serviceType.object)
			{
				var service = new serviceType.object;
				Vizi.Services[serviceName] = service;

				return service;
			}
			else
			{
		        throw new Error('No object type supplied for creating service ' + serviceName + '; cannot create');
			}
		}
	}
	else
	{
        throw new Error('Unknown service: ' + serviceName + '; cannot create');
	}
}

Vizi.Services.registerService = function(serviceName, object)
{
	if (Vizi.Services._serviceMap[serviceName])
	{
        throw new Error('Service ' + serviceName + 'already registered; cannot register twice');
	}
	else
	{
		var serviceType = { object: object };
		Vizi.Services._serviceMap[serviceName] = serviceType;
	}
}