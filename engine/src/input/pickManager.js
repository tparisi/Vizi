/**
 * @fileoverview Pick Manager - singleton to manage currently picked object(s)
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PickManager');

Vizi.PickManager.handleMouseMove = function(event)
{
    if (Vizi.PickManager.clickedObject)
    {
    	var pickers = Vizi.PickManager.clickedObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseMove) {
    			pickers[i].onMouseMove(event);
    		}
    	}
    }
    else
    {
        var oldObj = Vizi.PickManager.overObject;
        Vizi.PickManager.overObject = Vizi.PickManager.objectFromMouse(event);

        if (Vizi.PickManager.overObject != oldObj)
        {
    		if (oldObj)
    		{
    			Vizi.Graphics.instance.setCursor(null);

    			event.type = "mouseout";
    	    	var pickers = oldObj.pickers;
    	    	var i, len = pickers.length;
    	    	for (i = 0; i < len; i++) {
    	    		if (pickers[i].enabled && pickers[i].onMouseOut) {
    	    			pickers[i].onMouseOut(event);
    	    		}
    	    	}
    		}

            if (Vizi.PickManager.overObject)
            {            	
        		event.type = "mouseover";
    	    	var pickers = Vizi.PickManager.overObject.pickers;
    	    	var i, len = pickers.length;
    	    	for (i = 0; i < len; i++) {
    	    		
    	    		if (pickers[i].enabled && pickers[i].overCursor) {
    	        		Vizi.Graphics.instance.setCursor(pickers[i].overCursor);
    	    		}
    	    		
    	        	if (pickers[i].enabled && pickers[i].onMouseOver) {
    	        		pickers[i].onMouseOver(event);
    	        	}
    	    	}

            }
        }
    }
}

Vizi.PickManager.handleMouseDown = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    if (Vizi.PickManager.clickedObject)
    {
    	var pickers = Vizi.PickManager.clickedObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseDown) {
    			pickers[i].onMouseDown(event);
    		}
    	}
    }
}

Vizi.PickManager.handleMouseUp = function(event)
{
    if (Vizi.PickManager.clickedObject)
    {
    	var overobject = Vizi.PickManager.objectFromMouse(event);
    	var pickers = Vizi.PickManager.clickedObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseUp) {
    			pickers[i].onMouseUp(event);
    			// Also deliver a click event if we're over the same object as when
    			// the mouse was first pressed
    			if (overobject == Vizi.PickManager.clickedObject) {
    				event.type = "click";
    				pickers[i].onMouseClick(event);
    			}
    		}
    	}
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseClick = function(event)
{
	return;
	
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    
    if (Vizi.PickManager.clickedObject)
    {
    	var pickers = Vizi.PickManager.clickedObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseClick) {
    			pickers[i].onMouseClick(event);
    		}
    	}
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseDoubleClick = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    
    if (Vizi.PickManager.clickedObject)
    {
    	var pickers = Vizi.PickManager.clickedObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseDoubleClick) {
    			pickers[i].onMouseDoubleClick(event);
    		}
    	}
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseScroll = function(event)
{
    if (Vizi.PickManager.overObject)
    {
    	var pickers = Vizi.PickManager.overObject.pickers;
    	var i, len = pickers.length;
    	for (i = 0; i < len; i++) {
    		if (pickers[i].enabled && pickers[i].onMouseScroll) {
    			pickers[i].onMouseScroll(event);
    		}
    	}
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleTouchStart = function(event)
{
	if (event.touches.length > 0) {
		event.screenX = event.touches[0].screenX;
		event.screenY = event.touches[0].screenY;
		event.clientX = event.touches[0].clientX;
		event.clientY = event.touches[0].clientY;
		event.pageX = event.touches[0].pageX;
		event.pageY = event.touches[0].pageY;
		event.elementX = event.touches[0].elementX;
		event.elementY = event.touches[0].elementY;
	    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
	    if (Vizi.PickManager.clickedObject)
	    {
	    	var pickers = Vizi.PickManager.clickedObject.pickers;
	    	var i, len = pickers.length;
	    	for (i = 0; i < len; i++) {
	    		if (pickers[i].enabled && pickers[i].onTouchStart) {
	    			pickers[i].onTouchStart(event);
	    		}
	    	}
	    }
	}
}

Vizi.PickManager.handleTouchMove = function(event)
{
	if (event.touches.length > 0) {
		event.screenX = event.touches[0].screenX;
		event.screenY = event.touches[0].screenY;
		event.clientX = event.touches[0].clientX;
		event.clientY = event.touches[0].clientY;
		event.pageX = event.touches[0].pageX;
		event.pageY = event.touches[0].pageY;
		event.elementX = event.touches[0].elementX;
		event.elementY = event.touches[0].elementY;

		if (Vizi.PickManager.clickedObject) {
	    	var pickers = Vizi.PickManager.clickedObject.pickers;
	    	var i, len = pickers.length;
	    	for (i = 0; i < len; i++) {
	    		if (pickers[i].enabled && pickers[i].onTouchMove) {
	    			pickers[i].onTouchMove(event);
	    		}
	    	}
	    }
	}
}

Vizi.PickManager.handleTouchEnd = function(event)
{
	if (event.changedTouches.length > 0) {
		event.screenX = event.changedTouches[0].screenX;
		event.screenY = event.changedTouches[0].screenY;
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		event.pageX = event.changedTouches[0].pageX;
		event.pageY = event.changedTouches[0].pageY;
		event.elementX = event.changedTouches[0].elementX;
		event.elementY = event.changedTouches[0].elementY;
	    if (Vizi.PickManager.clickedObject)
	    {
	    	var pickers = Vizi.PickManager.clickedObject.pickers;
	    	var i, len = pickers.length;
	    	for (i = 0; i < len; i++) {
	    		if (pickers[i].enabled && pickers[i].onTouchEnd) {
	    			pickers[i].onTouchEnd(event);
	    		}
	    	}
	    }
	    
	    Vizi.PickManager.clickedObject = null;
	}	
}

Vizi.PickManager.objectFromMouse = function(event)
{
	var intersected = Vizi.Graphics.instance.objectFromMouse(event);
	if (intersected.object)
	{
		event.face = intersected.face;
		event.normal = intersected.normal;
		event.point = intersected.point;
		event.object = intersected.object;
		
    	if (intersected.object._object.pickers)
    	{
    		var pickers = intersected.object._object.pickers;
    		var i, len = pickers.length;
    		for (i = 0; i < len; i++) {
    			if (pickers[i].enabled) { // just need one :-)
    				return intersected.object._object;
    			}
    		}
    	}

		return Vizi.PickManager.findObjectPicker(event, intersected.hitPointWorld, intersected.object.object);
	}
	else
	{
		return null;
	}
}

Vizi.PickManager.findObjectPicker = function(event, hitPointWorld, object) {
	while (object) {
		
		if (object.data && object.data._object.pickers) {
    		var pickers = object.data._object.pickers;
    		var i, len = pickers.length;
    		for (i = 0; i < len; i++) {
    			if (pickers[i].enabled) { // just need one :-)
    				// Get the model space units for our event
    				var modelMat = new THREE.Matrix4;
    				modelMat.getInverse(object.matrixWorld);
    				event.point = hitPointWorld.clone();
    				event.point.applyMatrix4(modelMat);
    				return object.data._object;
    			}
    		}
		}

		object = object.parent;
	}
	
	return null;
}


Vizi.PickManager.clickedObject = null;
Vizi.PickManager.overObject  =  null;