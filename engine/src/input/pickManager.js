/**
 * @fileoverview Pick Manager - singleton to manage currently picked object(s)
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PickManager');

Vizi.PickManager.handleMouseMove = function(event)
{
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseMove)
    {
		Vizi.PickManager.clickedObject.onMouseMove(event);
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
    			
    			if (oldObj.onMouseOut)
                {
    				event.type = "mouseout";
                    oldObj.onMouseOut(event);
                }
    		}

            if (Vizi.PickManager.overObject)
            {            	
	        	if (Vizi.PickManager.overObject.overCursor)
	        	{
	        		Vizi.Graphics.instance.setCursor(Vizi.PickManager.overObject.overCursor);
	        	}
	        	
	        	if (Vizi.PickManager.overObject.onMouseOver)
	        	{
	        		event.type = "mouseover";
	        		Vizi.PickManager.overObject.onMouseOver(event);
	        	}
            }
        }
    }
}

Vizi.PickManager.handleMouseDown = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseDown)
    {
        Vizi.PickManager.clickedObject.onMouseDown(event);
    }
}

Vizi.PickManager.handleMouseUp = function(event)
{
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseUp)
    {
		Vizi.PickManager.clickedObject.onMouseUp(event);
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseClick = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseClick)
    {
		Vizi.PickManager.clickedObject.onMouseClick(event);
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseDoubleClick = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseDoubleClick)
    {
		Vizi.PickManager.clickedObject.onMouseDoubleClick(event);
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseScroll = function(event)
{
    if (Vizi.PickManager.overObject && Vizi.PickManager.overObject.onMouseScroll)
    {
        Vizi.PickManager.overObject.onMouseScroll(event);
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
	    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onTouchStart)
	    {
	        Vizi.PickManager.clickedObject.onTouchStart(event);
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

		if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onTouchMove) {
			Vizi.PickManager.clickedObject.onTouchMove(event);
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
	    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onTouchEnd)
	    {
			Vizi.PickManager.clickedObject.onTouchEnd(event);
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
		
    	if (intersected.object._object.picker && intersected.object._object.picker.enabled)
    	{
    		return intersected.object._object.picker;
    	}
    	else
    	{
    		return Vizi.PickManager.findObjectPicker(intersected.object.object);
    	}
	}
	else
	{
		return null;
	}
}

Vizi.PickManager.findObjectPicker = function(object)
{
	while (object)
	{
		if (object.data && object.data._object.picker && object.data._object.picker.enabled)
		{
			return object.data._object.picker;
		}
		else
		{
			object = object.parent;
		}
	}
	
	return null;
}


Vizi.PickManager.clickedObject = null;
Vizi.PickManager.overObject  =  null;