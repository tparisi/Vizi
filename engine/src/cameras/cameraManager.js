/**
 * @fileoverview Camera Manager - singleton to manage cameras, active, resize etc.
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.CameraManager');

Vizi.CameraManager.addCamera = function(camera)
{
	Vizi.CameraManager.cameraList.push(camera);
}

Vizi.CameraManager.removeCamera = function(camera)
{
    var i = Vizi.CameraManager.cameraList.indexOf(camera);

    if (i != -1)
    {
    	Vizi.CameraManager.cameraList.splice(i, 1);
    }
}

Vizi.CameraManager.setActiveCamera = function(camera)
{
	if (Vizi.CameraManager.activeCamera && Vizi.CameraManager.activeCamera != camera)
		Vizi.CameraManager.activeCamera.active = false;
	
	Vizi.CameraManager.activeCamera = camera;
	Vizi.Graphics.instance.setCamera(camera.object);
}


Vizi.CameraManager.handleWindowResize = function(width, height)
{
	var cameras = Vizi.CameraManager.cameraList;
	
	if (cameras.length == 0)
		return false;

	var i, len = cameras.length;
	for (i = 0; i < len; i++)
	{
		var camera = cameras[i];
		camera.aspect = width / height;
	}

	return true;
}


Vizi.CameraManager.cameraList = [];
Vizi.CameraManager.activeCamera = null;