goog.provide('Vizi');

Vizi.loadUrl = function(url, element, options) {
	
	options = options || {};
	options.container = element;
	var viewer = new Vizi.Viewer(options);
	var loader = new Vizi.Loader;
	loader.addEventListener("loaded", function(data) { onLoadComplete(data, loadStartTime); }); 
	loader.addEventListener("progress", function(progress) { onLoadProgress(progress); }); 
	var loadStartTime = Date.now();
	loader.loadScene(url);
	viewer.run();

	function onLoadComplete(data, loadStartTime) {
		var loadTime = (Date.now() - loadStartTime) / 1000;
		Vizi.System.log("Vizi.loadUrl, scene loaded in ", loadTime, " seconds.");
		viewer.replaceScene(data);
		if (viewer.cameras.length > 1) {
			viewer.useCamera(1);
		}
		
		if (options.headlight) {
			viewer.setHeadlightOn(true);
		}
	}

	function onLoadProgress(progress) {
		var percentProgress = progress.loaded / progress.total * 100;
		Vizi.System.log("Vizi.loadUrl, ", percentProgress, " % loaded.");
	}

	return { viewer : viewer };
}