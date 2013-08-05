/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.require('Vizi.Graphics');
goog.provide('Vizi.GraphicsThreeJS');

Vizi.GraphicsThreeJS = function()
{
	Vizi.Graphics.call(this);
}

goog.inherits(Vizi.GraphicsThreeJS, Vizi.Graphics);

Vizi.GraphicsThreeJS.prototype.initialize = function(param)
{
	param = param || {};
	
	// call all the setup functions
	this.initOptions(param);
	this.initPageElements(param);
	this.initScene();
	this.initRenderer(param);
	this.initMouse();
	this.initKeyboard();
	this.addDomHandlers();
}

Vizi.GraphicsThreeJS.prototype.focus = function()
{
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}

Vizi.GraphicsThreeJS.prototype.initOptions = function(param)
{
	this.displayStats = (param && param.displayStats) ? 
			param.displayStats : Vizi.GraphicsThreeJS.default_display_stats;
}

Vizi.GraphicsThreeJS.prototype.initPageElements = function(param)
{
    if (param.container)
    {
    	this.container = param.container;
    }
   	else
   	{
		this.container = document.createElement( 'div' );
	    document.body.appendChild( this.container );
   	}

    this.saved_cursor = this.container.style.cursor;
    
    if (this.displayStats)
    {
        var stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.left = '140px';
        stats.domElement.style.height = '40px';
        this.container.appendChild( stats.domElement );
        this.stats = stats;
    }
}

Vizi.GraphicsThreeJS.prototype.initScene = function()
{
    var scene = new THREE.Scene();

//    scene.add( new THREE.AmbientLight(0xffffff) ); //  0x505050 ) ); // 
	
    var camera = new THREE.PerspectiveCamera( 45, 
    		this.container.offsetWidth / this.container.offsetHeight, 1, 4000 );
    camera.position.set( 0, 0, 10 );

    scene.add(camera);
    
    this.scene = scene;
	this.camera = camera;
	
	this.backgroundLayer = {};
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, 
    		this.container.offsetWidth / this.container.offsetHeight, 1, 4000 );
    camera.position.set( 0, 0, 10 );	
    scene.add(camera);
    
    this.backgroundLayer.scene = scene;
    this.backgroundLayer.camera = camera;
}

Vizi.GraphicsThreeJS.prototype.initRenderer = function(param)
{
    var renderer = // Vizi.Config.USE_WEBGL ?
    	new THREE.WebGLRenderer( { antialias: true } ); // :
    	// new THREE.CanvasRenderer;
    	
    renderer.sortObjects = false;
    renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );

    if (param && param.backgroundColor)
    {
    	renderer.domElement.style.backgroundColor = param.backgroundColor;
    	renderer.domElement.setAttribute('z-index', -1);
    }
    
    this.container.appendChild( renderer.domElement );

    var projector = new THREE.Projector();

    this.renderer = renderer;
    this.projector = projector;

    this.lastFrameTime = 0;
}

Vizi.GraphicsThreeJS.prototype.initMouse = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false );
	
	$(dom).mousewheel(
	        function(e, delta) {
	            that.onDocumentMouseScroll(e, delta);
	        }
	    );
	
}

Vizi.GraphicsThreeJS.prototype.initKeyboard = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    
}

Vizi.GraphicsThreeJS.prototype.addDomHandlers = function()
{
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}

Vizi.GraphicsThreeJS.prototype.objectFromMouse = function(eltx, elty)
{
	// translate client coords into vp x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);
	
    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObjects( this.scene.children, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	
    	if (i >= intersects.length)
    	{
        	return { object : null, point : null, normal : null };
    	}
    	
    	return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal));        	    	                             
    }
    else
    {
    	return { object : null, point : null, normal : null };
    }
}

Vizi.GraphicsThreeJS.prototype.findObjectFromIntersected = function(object, point, normal)
{
	if (object.data)
	{
		return { object: object.data, point: point, normal: normal };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point, normal);
	}
	else
	{
		return { object : null, point : null, normal : null };
	}
}

Vizi.GraphicsThreeJS.prototype.nodeFromMouse = function(eltx, elty)
{
	// Blerg, this is to support code outside the SB components & picker framework
	// Returns a raw Three.js node
	
	// translate client coords into vp x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);

    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObjects( this.scene.children, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	if (intersected)
    	{
    		return { node : intersected.object, 
    				 point : intersected.point, 
    				 normal : intersected.face.normal
    				}
    	}
    	else
    		return null;
    }
    else
    {
    	return null;
    }
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseMove = function(event)
{
    event.preventDefault();
    
	var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
    Vizi.Mouse.instance.onMouseMove(eltx, elty);
    
    if (Vizi.Picker)
    {
    	Vizi.Picker.handleMouseMove(eltx, elty);
    }
    
    Vizi.Application.handleMouseMove(event.pageX, event.pageY, eltx, elty);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseDown = function(event)
{
    event.preventDefault();
    
	var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
    Vizi.Mouse.instance.onMouseDown(eltx, elty);
    
    if (Vizi.Picker)
    {
    	Vizi.Picker.handleMouseDown(eltx, elty);
    }
    
    Vizi.Application.handleMouseDown(event.pageX, event.pageY, eltx, elty);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseUp = function(event)
{
    event.preventDefault();

    var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
    
    Vizi.Mouse.instance.onMouseUp(eltx, elty);
    
    if (Vizi.Picker)
    {
    	Vizi.Picker.handleMouseUp(eltx, elty);
    }	            

    Vizi.Application.handleMouseUp(event.pageX, event.pageY, eltx, elty);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseScroll = function(event, delta)
{
    event.preventDefault();
    
    Vizi.Mouse.instance.onMouseScroll(delta);

    if (Vizi.Picker)
    {
    	Vizi.Picker.handleMouseScroll(delta);
    }
    
    Vizi.Application.handleMouseScroll(delta);
}

Vizi.GraphicsThreeJS.prototype.onKeyDown = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyDown(event.keyCode, event.charCode);
    
	Vizi.Application.handleKeyDown(event.keyCode, event.charCode);
}

Vizi.GraphicsThreeJS.prototype.onKeyUp = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyUp(event.keyCode, event.charCode);
    
	Vizi.Application.handleKeyUp(event.keyCode, event.charCode);
}
	        
Vizi.GraphicsThreeJS.prototype.onKeyPress = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyPress(event.keyCode, event.charCode);
    
	Vizi.Application.handleKeyPress(event.keyCode, event.charCode);
}

Vizi.GraphicsThreeJS.prototype.onWindowResize = function(event)
{
	this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

	this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
	this.camera.updateProjectionMatrix();
}

Vizi.GraphicsThreeJS.prototype.setCursor = function(cursor)
{
	if (!cursor)
		cursor = this.saved_cursor;
	
	this.container.style.cursor = cursor;
}


Vizi.GraphicsThreeJS.prototype.update = function()
{
    this.renderer.setClearColor( 0, 0 );
	this.renderer.autoClearColor = true;
    this.renderer.render( this.backgroundLayer.scene, this.backgroundLayer.camera );
    this.renderer.setClearColor( 0, 1 );
	this.renderer.autoClearColor = false;
    this.renderer.render( this.scene, this.camera );

    var frameTime = Date.now();
    var deltat = (frameTime - this.lastFrameTime) / 1000;
    this.frameRate = 1 / deltat;

    this.lastFrameTime = frameTime;
    	
    if (this.stats)
    {
    	this.stats.update();
    }
    
    if (window.TWEEN !== undefined)
    {
    	TWEEN.update();
    }
}

Vizi.GraphicsThreeJS.prototype.enableShadows = function(enable)
{
	this.renderer.shadowMapEnabled = enable;
	this.renderer.shadowMapSoft = enable;
	this.renderer.shadowMapCullFrontFaces = false;
}

Vizi.GraphicsThreeJS.default_display_stats = false,
