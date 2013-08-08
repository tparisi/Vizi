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
	if (Vizi.CameraManager.activeCamera)
		Vizi.CameraManager.activeCamera.active = false;
	
	Vizi.CameraManager.activeCamera = camera;
	Vizi.Graphics.instance.camera = camera.object;
}

Vizi.CameraManager.cameraList = [];
Vizi.CameraManager.activeCamera = null;