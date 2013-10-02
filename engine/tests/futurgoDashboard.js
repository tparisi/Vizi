/*
 * dashboard script for futurgo vehicle
 * extends Vizi.Script
 */

FuturgoDashboardScript = function(param)
{
	param = param || {};
	
	Vizi.Script.call(this, param);

	this.enabled = (param.enabled !== undefined) ? param.enabled : true;	
	
	this.backgroundColor = param.backgroundColor || '#ff0000';
	this.textColor = param.textColor || '#aa0000';
	this._speed = 0;
	this._rpm = 0;
	this._carController = null;
	this.needsUpdate = false;
	
    Object.defineProperties(this, {
    	speed: {
			get : function() {
				return this._speed;
			},
			set: function(v) {
				this.setSpeed(v);
			}
		},
    	rpm: {
			get : function() {
				return this._rpm;
			},
			set: function(v) {
				this._rpm = v;
				this.needsUpdate = true;
			}
		},
		carController: {
			get : function() {
				return this._carController;
			},
			set: function(controller) {
				this.setCarController(controller);
			}			
		},
    });
}

goog.inherits(FuturgoDashboardScript, Vizi.Script);

FuturgoDashboardScript.prototype.realize = function()
{
	// Set up the guages
	var guage = this._object.findNode("head_light_L1");
	var visual = guage.visuals[0];
	var texture = visual.material.map;
	
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    
	var texture = new THREE.Texture(canvas);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	visual.material.map = texture;
	
	this.texture = texture;
	this.canvas = canvas;
	this.context = canvas.getContext("2d");

	this.dashboardImage = null;
	this.dialImage = null;
	
	var that = this;
	var image1 = new Image();  
    image1.onload = function () {  
    	that.dashboardImage = image1;
        that.needsUpdate = true;
    }  
    image1.src = FuturgoDashboardScript.dashboardURL;

	var image2 = new Image();  
    image2.onload = function () {  
    	that.dialImage = image2;
        that.needsUpdate = true;
    }  
    image2.src = FuturgoDashboardScript.dialURL;

    this.needsUpdate = true;
}

FuturgoDashboardScript.prototype.update = function()
{
	if (!this.enabled)
		return;

	this.demoMode = true;
	if (this.demoMode) {
		this.demo();
	}
	
	if (this.needsUpdate) {

		this.draw();
	
		// this.texture.offset.x += 0.01;
		this.texture.needsUpdate = true;
		this.needsUpdate = false;
	}
}

FuturgoDashboardScript.prototype.draw = function()
{
	var context = this.context;
	var canvas = this.canvas;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = this.backgroundColor;
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = this.textColor;

	if (this.dashboardImage) {
		context.drawImage(this.dashboardImage, 0, 0);  
	}
	
	this.theta = -Math.PI * 3 / 4 + this._speed * Math.PI;
	this.rpmtheta = -Math.PI / 2 + this._rpm * Math.PI;
	
	if (this.dialImage) {
		context.save();
		
		context.translate(FuturgoDashboardScript.speedDialLeftOffset, 
				FuturgoDashboardScript.speedDialTopOffset);
		context.rotate(this.theta);
		context.translate(-FuturgoDashboardScript.dialCenterLeftOffset, 
				-FuturgoDashboardScript.dialCenterTopOffset);
		context.drawImage(this.dialImage, 0, 0); // 198, 25, 115);  
		context.restore();

		context.save();
		
		context.translate(FuturgoDashboardScript.rpmDialLeftOffset, 
				FuturgoDashboardScript.rpmDialTopOffset);
		context.rotate(this.rpmtheta);
		context.translate(-FuturgoDashboardScript.dialCenterLeftOffset, 
				-FuturgoDashboardScript.dialCenterTopOffset);
		context.drawImage(this.dialImage, 0, 0); // 198, 25, 115);  
		context.restore();
	}	
}

FuturgoDashboardScript.prototype.demo = function() {
	
	this._speed += 0.01;
	if (this._speed > 1)
		this._speed = 0;
	this._rpm += 0.025;
	if (this._rpm > 2)
		this._rpm = 0;
	
	this.needsUpdate = true;
}

FuturgoDashboardScript.prototype.setSpeed = function(speed) {
	this._speed = speed;
	this.needsUpdate = true;
}

FuturgoDashboardScript.prototype.setRPM = function(rpm) {
	this._rpm = rpm;
	this.needsUpdate = true;
}

FuturgoDashboardScript.prototype.setCarController = function(controller) {

	this._carController = controller;
	
	var that = this;
	controller.addEventListener("speed", function(speed) { that.setSpeed(speed); });
	controller.addEventListener("rpm", function(speed) { that.setRPM(rpm); });
}

// Constants
FuturgoDashboardScript.imagePath = './models/futurgo_mobile/images/';
FuturgoDashboardScript.dashboardURL = FuturgoDashboardScript.imagePath + 'gauges.png';
FuturgoDashboardScript.dialURL = FuturgoDashboardScript.imagePath + 'dial2.png';
FuturgoDashboardScript.speedDialLeftOffset = 256;
FuturgoDashboardScript.speedDialTopOffset = 175;
FuturgoDashboardScript.rpmDialLeftOffset = 403;
FuturgoDashboardScript.rpmDialTopOffset = 360;
FuturgoDashboardScript.dialCenterLeftOffset = 12;
FuturgoDashboardScript.dialCenterTopOffset = 90;



