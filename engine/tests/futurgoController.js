/*
 * controller script for futurgo vehicle
 * extends Vizi.Script
 */

FuturgoControllerScript = function(param)
{
	param = param || {};
	
	Vizi.Script.call(this, param);

	this.enabled = (param.enabled !== undefined) ? param.enabled : true;
	
	this.collisionDistance = 10;
	this.moveSpeed = 13;
	this.turnSpeed = Math.PI / 2; // 90 degs/sec

	this.moveForward = false;
	this.moveBackward = false;
	this.turnLeft = false;
	this.turnRight = false;
	
	this.yAdjustedPosition = new THREE.Vector3;
	
	this.savedPos = new THREE.Vector3;	
	this.movementVector = new THREE.Vector3;	
	
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
	
	this.savePosition();
	this.updatePosition();	
	var collide = this.testCollision();
	if (collide && collide.object) {
		this.restorePosition();
		this.dispatchEvent("collide", collide);
	}
}

FuturgoControllerScript.prototype.updatePosition = function() {

	var now = Date.now();
	var deltat = now - this.lastUpdateTime;	
	
	var actualMoveSpeed = deltat / 1000 * this.moveSpeed;
	var actualTurnSpeed = deltat / 1000 * this.turnSpeed;
	
	// Translate in Z
	if ( this.moveForward ) 
		this._object.transform.object.translateZ( -actualMoveSpeed );

	if ( this.moveBackward ) 
		this._object.transform.object.translateZ( actualMoveSpeed );

	// but keep the vehicle on the ground
	this._object.transform.position.y = this.startY;

	// Turn
	if ( this.turnLeft ) {
		this._object.transform.object.rotateY( actualTurnSpeed );
		//this.steeringWheel.transform.rotation.z = Math.PI / 96;
	}
	else if ( this.turnRight ) {
		this._object.transform.object.rotateY( -actualTurnSpeed );
		//this.steeringWheel.transform.rotation.z = -Math.PI / 96;
	}
	else {
		//this.steeringWheel.transform.rotation.z = 0;
	}
	
	this.lastUpdateTime = now;
	
	
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
	
	if (this.movementVector.length()) {
		
        var collide = Vizi.Graphics.instance.objectFromRay(this.yAdjustedPosition,
        		this.movementVector, 1, 2);

        if (collide && collide.object) {
        	var dist = this.yAdjustedPosition.distanceTo(collide.hitPointWorld);
        	console.log("Collision: ", collide);
        }
        
        return collide;
	}
	
	return null;
}

// Keyboard handlers
FuturgoControllerScript.prototype.onKeyDown = function ( event ) {

	//event.preventDefault();

	switch ( event.keyCode ) {

		case 38: /*up*/
		case 87: /*W*/ this.moveForward = true; break;

		case 37: /*left*/
		case 65: /*A*/ this.turnLeft = true; break;

		case 40: /*down*/
		case 83: /*S*/ this.moveBackward = true; break;

		case 39: /*right*/
		case 68: /*D*/ this.turnRight = true; break;

		case 82: /*R*/ this.moveUp = true; break;
		case 70: /*F*/ this.moveDown = true; break;

		case 81: /*Q*/ this.freeze = !this.freeze; break;

	}

}

FuturgoControllerScript.prototype.onKeyUp = function ( event ) {

	switch( event.keyCode ) {

		case 38: /*up*/
		case 87: /*W*/ this.moveForward = false; break;

		case 37: /*left*/
		case 65: /*A*/ this.turnLeft = false; break;

		case 40: /*down*/
		case 83: /*S*/ this.moveBackward = false; break;

		case 39: /*right*/
		case 68: /*D*/ this.turnRight = false; break;

		case 82: /*R*/ this.moveUp = false; break;
		case 70: /*F*/ this.moveDown = false; break;

	}

};

FuturgoControllerScript.prototype.onKeyPress = function ( event ) {
}


