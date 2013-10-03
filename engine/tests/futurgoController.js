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
	
	this.accelerate = false;
	this.brake = false;
	this.acceleration = 0;
	this.braking = 0;
	this.speed = 0;
	this.rpm = 0;
	
	this.yAdjustedPosition = new THREE.Vector3;
	
	this.savedPos = new THREE.Vector3;	
	this.movementVector = new THREE.Vector3;	

	this.lastUpdateTime = Date.now();
	this.accelerateStartTime = this.brakeStartTime = 
		this.accelerateEndTime = this.brakeEndTime = 
		this.lastUpdateTime;
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
	this.updateSpeed(now, deltat);
	this.updatePosition(now, deltat);	
	this.testCollision();
	
	this.lastUpdateTime = now;
}

FuturgoControllerScript.prototype.updateSpeed = function(now, deltat) {
	
	var speed = this.speed, rpm = this.rpm;
	
	// Accelerate if the pedal is down
	if (this.accelerate) {
		var deltaA = now - this.accelerateStartTime;
		this.acceleration = deltaA / 1000 * FuturgoControllerScript.ACCELERATION;		
	}
	else {
		// Apply momentum
		var deltaA = now - this.accelerateEndTime;
		this.acceleration -= deltaA / 1000 * FuturgoControllerScript.INERTIA;		
		this.acceleration = Math.max( 0, Math.min( FuturgoControllerScript.MAX_ACCELERATION, 
			this.acceleration) );
	}

	speed += this.acceleration;
	
	// Slow down if the brake is down
	if (this.brake) {
		var deltaB = now - this.brakeStartTime;
		var braking = deltaB / 1000 * FuturgoControllerScript.BRAKING;

		speed -= braking;
	}
	else {
		// Apply inertia
		var inertia = deltat / 1000 * FuturgoControllerScript.INERTIA;
		speed -= inertia;
	}
	
	speed = Math.max( 0, Math.min( FuturgoControllerScript.MAX_SPEED, speed ) );
	rpm = Math.max( 0, Math.min( FuturgoControllerScript.MAX_ACCELERATION, this.acceleration ) );

	if (this.speed != speed) {
		this.speed = speed;
		this.dispatchEvent("speed", speed);
	}
	
	if (this.rpm != rpm) {
		this.rpm = rpm;
		this.dispatchEvent("rpm", rpm);
	}
}

FuturgoControllerScript.prototype.updatePosition = function(now, deltat) {

	this.moveSpeed = this.speed;
	
	var actualMoveSpeed = deltat / 1000 * this.moveSpeed;
	var actualTurnSpeed = deltat / 1000 * this.turnSpeed;

	// Translate in Z...
	this._object.transform.object.translateZ( -actualMoveSpeed );
	
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
			if (!this.accelerate) {
				this.accelerateStartTime = Date.now();
				this.accelerate = true; 
			}
			break;

		case 37: /*left*/
		case 65: /*A*/ 
			this.turnLeft = true; 
			break;

		case 40: /*down*/
		case 83: /*S*/
			this.moveBackward = true;
			if (!this.brake) {
				this.brakeStartTime = Date.now();
				this.brake = true; 
			}
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
			if (this.accelerate) {
				this.accelerate = false; 
				this.accelerateEndTime = Date.now(); 
			}
			break;

		case 37: /*left*/
		case 65: /*A*/
			this.turnLeft = false; 
			break;

		case 40: /*down*/
		case 83: /*S*/
			this.moveBackward = false; 
			if (this.brake) {
				this.brake = false; 
				this.brakeEndTime = Date.now(); 
			}
			break;

		case 39: /*right*/
		case 68: /*D*/ 
			this.turnRight = false; 
			break;

	}

}

FuturgoControllerScript.prototype.onKeyPress = function ( event ) {
}

FuturgoControllerScript.ACCELERATION = 2; // m/s
FuturgoControllerScript.BRAKING = 1.5; // m/s
FuturgoControllerScript.INERTIA = 12; // m/s
FuturgoControllerScript.COLLISION_MIN = 1; // m
FuturgoControllerScript.COLLISION_MAX = 2; // m
FuturgoControllerScript.MAX_SPEED = 24; // m/s
FuturgoControllerScript.MAX_ACCELERATION = 24; // m/s
