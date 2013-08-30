/**
 * @fileoverview Loader - loads level files
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Loader');
goog.require('Vizi.EventDispatcher');

/**
 * @constructor
 * @extends {Vizi.PubSub}
 */
Vizi.Loader = function()
{
    Vizi.EventDispatcher.call(this);	
}

goog.inherits(Vizi.Loader, Vizi.EventDispatcher);
        
Vizi.Loader.prototype.loadModel = function(url)
{
	var spliturl = url.split('.');
	var len = spliturl.length;
	var ext = '';
	if (len)
	{
		ext = spliturl[len - 1];
	}
	
	if (ext && ext.length)
	{
	}
	else
	{
		return;
	}
	
	var loaderClass;
	
	switch (ext.toUpperCase())
	{
		case 'JS' :
			loaderClass = THREE.JSONLoader;
			break;
		default :
			break;
	}
	
	if (loaderClass)
	{
		var loader = new loaderClass;
		var that = this;
		
		loader.load(url, function (data) {
			that.handleModelLoaded(url, data);
		});		
	}
}

Vizi.Loader.prototype.handleModelLoaded = function(url, data)
{
	if (data.scene)
	{
		var material = new THREE.MeshFaceMaterial();
		var mesh = new Vizi.Visual({geometry:data, material:material});
		this.dispatchEvent("loaded", mesh);
	}
}

Vizi.Loader.prototype.loadScene = function(url)
{
	var spliturl = url.split('.');
	var len = spliturl.length;
	var ext = '';
	if (len)
	{
		ext = spliturl[len - 1];
	}
	
	if (ext && ext.length)
	{
	}
	else
	{
		return;
	}
	
	var loaderClass;
	
	switch (ext.toUpperCase())
	{
		case 'DAE' :
			loaderClass = THREE.ColladaLoader;
			break;
		case 'JS' :
			loaderClass = THREE.SceneLoader;
			break;
		default :
			break;
	}
	
	if (loaderClass)
	{
		var loader = new loaderClass;
		var that = this;
		
		loader.load(url, 
				function (data) {
					that.handleSceneLoaded(url, data);
				},
				function (data) {
					that.handleSceneProgress(url, data);
				}
		);		
	}
}

Vizi.Loader.prototype.traverseCallback = function(n, result)
{
	// Look for cameras
	if (n instanceof THREE.Camera)
	{
		if (!result.cameras)
			result.cameras = [];
		
		result.cameras.push(n);
	}

	// Look for lights
	if (n instanceof THREE.Light)
	{
		if (!result.lights)
			result.lights = [];
		
		result.lights.push(n);
	}
}

Vizi.Loader.prototype.handleSceneLoaded = function(url, data)
{
	var result = {};
	var success = false;
	
	if (data.scene)
	{
		var convertedScene = this.convertScene(data.scene);
		
		result.scene = convertedScene; // new Vizi.SceneVisual({scene:data.scene}); // 
		var that = this;
		data.scene.traverse(function (n) { that.traverseCallback(n, result); });
		success = true;
	}
	
	if (data.animations)
	{
		result.keyFrameAnimators = [];
		var i, len = data.animations.length;
		for (i = 0; i < len; i++)
		{
			var animations = [];
			animations.push(data.animations[i]);
			result.keyFrameAnimators.push(new Vizi.KeyFrameAnimator({animations:animations}));
		}
	}
	
	/*
	if (data.skins && data.skins.length)
	{
		// result.meshAnimator = new Vizi.MeshAnimator({skins:data.skins});
	}
	*/
	
	if (success)
		this.dispatchEvent("loaded", result);
}

Vizi.Loader.prototype.handleSceneProgress = function(url, progress)
{
	this.dispatchEvent("progress", progress);
}

Vizi.Loader.prototype.convertScene = function(scene) {

	function convert(n) {
		if (n instanceof THREE.Mesh) {
			return new Vizi.Visual({object:n});
		}
		else if (n instanceof THREE.Camera) {
			if (n instanceof THREE.PerspectiveCamera) {
				return new Vizi.PerspectiveCamera({object:n});
			}
		}
		else if (n instanceof THREE.Light) {
			if (n instanceof THREE.AmbientLight) {
				return new Vizi.AmbientLight({object:n});
			}
			else if (n instanceof THREE.DirectionalLight) {
				return new Vizi.DirectionalLight({object:n});
			}
			else if (n instanceof THREE.PointLight) {
				return new Vizi.PointLight({object:n});
			}
			else if (n instanceof THREE.SpotLight) {
				return new Vizi.SpotLight({object:n});
			}
		}
		else if (n.children) {
			var o = new Vizi.Object({autoCreateTransform:false});
			o.addComponent(new Vizi.Transform({object:n}));
			o.name = n.name;
			var i, len = n.children.length;
			for (i = 0; i < len; i++) {
				var childNode  = n.children[i];
				var c = convert(childNode);
				if (c instanceof Vizi.Object) {
					o.addChild(c);
				}
				else if (c instanceof Vizi.Component) {
					o.addComponent(c);
				}
				else {
					// N.B.: what???
				}
			}
		}
		
		return o;
	}

	return convert(scene);
}
