/*
 * controller script for futurgo vehicle
 * extends Vizi.Script
 */

FuturgoControllerScript = function(param)
{
	param = param || {};
	
	Vizi.Script.call(this, param);

	this.enabled = (param.enabled !== undefined) ? param.enabled : true;
	
	this.moveSpeed = 13;
	this.turnSpeed = Math.PI / 2; // 90 degs/sec

	this.moveForward = false;
	this.moveBackward = false;
	this.turnLeft = false;
	this.turnRight = false;
	
	this.acceleration = 0;
	this.braking = 0;
	this.speed = 0;
	
	this.yAdjustedPosition = new THREE.Vector3;
	
	this.savedPos = new THREE.Vector3;	
	this.movementVector = new THREE.Vector3;	

	this.lastUpdateTime = Date.now();
}

goog.inherits(FuturgoControllerScript, Vizi.Script);

FuturgoControllerScript.prototype.realize = function()
{
	this.lastUpdateTime = Date.now();
	this.startY = this._object.transform.position.y;
	
	this.steeringWheel = this._object.findNode("polySurface93");
}

FuturgoControllerScript.prototype.update = function()
{
	if (!this.enabled)
		return;
	
	var now = Date.now();
	var deltat = now - this.lastUpdateTime;

	this.savePosition();
	this.updateSpeed(deltat);
	this.updatePosition(deltat);	
	this.testCollision();
	
	this.lastUpdateTime = now;
}

FuturgoControllerScript.prototype.updateSpeed = function() {
	
}

FuturgoControllerScript.prototype.updatePosition = function(deltat) {

	var actualMoveSpeed = deltat / 1000 * this.moveSpeed;
	var actualTurnSpeed = deltat / 1000 * this.turnSpeed;
	
	// Translate in Z...
	if ( this.moveForward ) {
		var actualMoveSpeed = deltat / 1000 * this.moveSpeed;
		this.dispatchEvent("speed", actualMoveSpeed);
		this._object.transform.object.translateZ( -actualMoveSpeed );
	}

	if ( this.moveBackward ) {
		this.moveSpeed /= 1.01;
		var actualMoveSpeed = deltat / 1000 * this.moveSpeed;
		this.dispatchEvent("speed", actualMoveSpeed);
		this._object.transform.object.translateZ( actualMoveSpeed );
	}
	
	// ...but keep the vehicle on the ground
	this._object.transform.position.y = this.startY;

	// Turn
	if ( this.turnLeft ) {
		this._object.transform.object.rotateY( actualTurnSpeed );
	}
	
	if ( this.turnRight ) {
		this._object.transform.object.rotateY( -actualTurnSpeed );
	}
	
}

FuturgoControllerScript.prototype.savePosition = function() {
	this.savedPos.copy(this._object.transform.position);
}

FuturgoControllerScript.prototype.restorePosition = function() {
	this._object.transform.position.copy(this.savedPos);
}

FuturgoControllerScript.prototype.testCollision = function() {
	
	this.movementVector.copy(this._object.transform.position).sub(this.savedPos);
	this.yAdjustedPosition.copy(this.savedPos);
	this.yAdjustedPosition.y = FuturgoCity.AVATAR_HEIGHT_SEATED;
	
	var collide = null;
	if (this.movementVector.length()) {

        collide = Vizi.Graphics.instance.objectFromRay(this.yAdjustedPosition,
        		this.movementVector, 
        		FuturgoControllerScript.COLLISION_MIN, 
        		FuturgoControllerScript.COLLISION_MAX);

        if (collide && collide.object) {
        	var dist = this.yAdjustedPosition.distanceTo(collide.hitPointWorld);
        }
	}
	
	if (collide && collide.object) {
		this.restorePosition();
		this.dispatchEvent("collide", collide);
	}
	
}

// Keyboard handlers
FuturgoControllerScript.prototype.onKeyDown = function ( event ) {

	//event.preventDefault();

	switch ( event.keyCode ) {

		case 38: /*up*/
		case 87: /*W*/
			this.moveForward = true; 
			this.accelerate = true; 
			this.accelerateTime = Date.now();
			break;

		case 37: /*left*/
		case 65: /*A*/ 
			this.turnLeft = true; 
			break;

		case 40: /*down*/
		case 83: /*S*/
			this.moveBackward = true;
			this.brake = true; 
			this.brakeTime = Date.now();
			break;

		case 39: /*right*/
		case 68: /*D*/
			this.turnRight = true; 
			break;

	}

}

FuturgoControllerScript.prototype.onKeyUp = function ( event ) {

	switch( event.keyCode ) {

		case 38: /*up*/
		case 87: /*W*/
			this.moveForward = false; 
			this.accelerate = false; 
			break;

		case 37: /*left*/
		case 65: /*A*/
			this.turnLeft = false; 
			break;

		case 40: /*down*/
		case 83: /*S*/
			this.moveBackward = false; 
			this.brake = false; 
			break;

		case 39: /*right*/
		case 68: /*D*/ 
			this.turnRight = false; 
			break;

	}

};

FuturgoControllerScript.prototype.onKeyPress = function ( event ) {
}

FuturgoControllerScript.ACCELERATION = 1; // m/s
FuturgoControllerScript.BRAKING = 1; // m/s
FuturgoControllerScript.COLLISION_MIN = 1; // m
FuturgoControllerScript.COLLISION_MAX = 2; // m

