/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

/* Heavily adapted version of Three.js FirstPerson controls for Vizi
 * 
 */

goog.provide('Vizi.FirstPersonControls');

Vizi.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 1.0;

	this.mouseX = 0;
	this.mouseY = 0;
	this.lastMouseX = 0;
	this.lastMouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseDragOn = false;
	this.mouseLook = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}
				
		this.lastMouseX = this.mouseX;
		this.lastMouseY = this.mouseY;
		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onTouchStart = function ( event ) {
		// synthesize a left mouse button event
		var mouseEvent = {
			'type': 'mousedown',
		    'view': event.view,
		    'bubbles': event.bubbles,
		    'cancelable': event.cancelable,
		    'detail': event.detail,
		    'screenX': event.touches[0].screenX,
		    'screenY': event.touches[0].screenY,
		    'clientX': event.touches[0].clientX,
		    'clientY': event.touches[0].clientY,
		    'pageX': event.touches[0].pageX,
		    'pageY': event.touches[0].pageY,
		    'button': 0,
		    'preventDefault' : function() {}
			};
		
		this.onMouseDown(mouseEvent);
		
		if (event.touches.length > 1) {
			// second touch does move
			this.touchScreenX = event.touches[1].screenX; 
			this.touchScreenY = event.touches[1].screenY; 
		}
	}

	
	this.onTouchMove = function ( event ) {
		// synthesize a left mouse button event
		var mouseEvent = {
			'type': 'mousemove',
		    'view': event.view,
		    'bubbles': event.bubbles,
		    'cancelable': event.cancelable,
		    'detail': event.detail,
		    'screenX': event.touches[0].screenX,
		    'screenY': event.touches[0].screenY,
		    'clientX': event.touches[0].clientX,
		    'clientY': event.touches[0].clientY,
		    'pageX': event.touches[0].pageX,
		    'pageY': event.touches[0].pageY,
		    'button': 0,
		    'preventDefault' : function() {}
			};
		
		this.onMouseMove(mouseEvent);

		if (event.touches.length > 1) {
			// second touch does move
			var deltaX = event.touches[1].screenX - this.touchScreenX;
			var deltaY = event.touches[1].screenX - this.touchScreenY;
			this.lastKeyX = deltaX < 0 ? 37 : 39;
			this.lastKeyY = deltaY > 0 ? 38 : 40;
			
			this.touchScreenX = event.touches[1].screenX; 
			this.touchScreenY = event.touches[1].screenY; 
			
			if (deltaX) {
				// synthesize a keyboard event
				var keyEvent = {
					'type': 'keydown',
					'keyCode' : this.lastKeyX,
				    'view': event.view,
				    'bubbles': event.bubbles,
				    'cancelable': event.cancelable,
				    'detail': event.detail,
				    'preventDefault' : function() {}
					};
			
				this.onKeyDown(keyEvent);
			}

			if (deltaY) {
				// synthesize a keyboard event
				var keyEvent = {
					'type': 'keydown',
					'keyCode' : this.lastKeyY,
				    'view': event.view,
				    'bubbles': event.bubbles,
				    'cancelable': event.cancelable,
				    'detail': event.detail,
				    'preventDefault' : function() {}
					};
			
				this.onKeyDown(keyEvent);
			}
		}
	}

	
	this.onTouchEnd = function ( event ) {
		// synthesize a left mouse button event
		var mouseEvent = {
			'type': 'mouseup',
		    'view': event.view,
		    'bubbles': event.bubbles,
		    'cancelable': event.cancelable,
		    'detail': event.detail,
		    'screenX': event.changedTouches[0].screenX,
		    'screenY': event.changedTouches[0].screenY,
		    'clientX': event.changedTouches[0].clientX,
		    'clientY': event.changedTouches[0].clientY,
		    'pageX': event.changedTouches[0].pageX,
		    'pageY': event.changedTouches[0].pageY,
		    'button': 0,
		    'preventDefault' : function() {}
		};
		
		this.onMouseUp(mouseEvent);

		if (event.changeTouches.length > 1) {
			// second touch does move
			var deltaX = event.changeTouches[1].screenX - this.touchScreenX;
			var deltaY = event.changeTouches[1].screenX - this.touchScreenY;
			this.lastKeyX = deltaX < 0 ? 37 : 39;
			this.lastKeyY = deltaY > 0 ? 38 : 40;
			
			this.touchScreenX = event.changeTouches[1].screenX; 
			this.touchScreenY = event.changeTouches[1].screenY; 
			
			if (deltaX) {
				// synthesize a keyboard event
				var keyEvent = {
					'type': 'keyup',
					'keyCode' : this.lastKeyX,
				    'view': event.view,
				    'bubbles': event.bubbles,
				    'cancelable': event.cancelable,
				    'detail': event.detail,
				    'preventDefault' : function() {}
					};
			
				this.onKeyUp(keyEvent);
			}

			if (deltaY) {
				// synthesize a keyboard event
				var keyEvent = {
					'type': 'keyup',
					'keyCode' : this.lastKeyY,
				    'view': event.view,
				    'bubbles': event.bubbles,
				    'cancelable': event.cancelable,
				    'detail': event.detail,
				    'preventDefault' : function() {}
					};
			
				this.onKeyUp(keyEvent);
			}
		}
	
	}
	
	
	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {

		this.startY = this.object.position.y;
		
		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward ) 
			this.object.translateZ( - actualMoveSpeed );
		if ( this.moveBackward ) 
			this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) 
			this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) 
			this.object.translateX( actualMoveSpeed );

		this.object.position.y = this.startY;
		
		var actualLookSpeed = delta * this.lookSpeed;

		var DRAG_DEAD_ZONE = 1;
		
		if (this.mouseDragOn || this.mouseLook) {
			
			var deltax = this.lastMouseX - this.mouseX;
			if (Math.abs(deltax) < DRAG_DEAD_ZONE)
				dlon = 0;
			var dlon = deltax / this.viewHalfX * 900;
			this.lon += dlon * this.lookSpeed;

			var deltay = this.lastMouseY - this.mouseY;
			if (Math.abs(deltay) < DRAG_DEAD_ZONE)
				dlat = 0;
			var dlat = deltay / this.viewHalfY * 900;
			this.lat += dlat * this.lookSpeed;
			
			this.theta = THREE.Math.degToRad( this.lon );

			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = THREE.Math.degToRad( this.lat );

			var targetPosition = this.target,
				position = this.object.position;
	
			targetPosition.x = position.x - Math.sin( this.theta );
			targetPosition.y = position.y + Math.sin( this.phi );
			targetPosition.z = position.z - Math.cos( this.theta );
	
			this.object.lookAt( targetPosition );
			
			this.lastMouseX = this.mouseX;
			this.lastMouseY = this.mouseY;
		}
		
	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), true );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'touchstart', bind( this, this.onTouchStart), false );
	this.domElement.addEventListener( 'touchmove', bind( this, this.onTouchMove), false );
	this.domElement.addEventListener( 'touchend', bind( this, this.onTouchEnd), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	this.domElement.addEventListener( 'resize', bind( this, this.handleResize ), false );
	
	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.handleResize();

};
