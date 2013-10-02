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
	this.theta = 0;
	this.speed = 0;
	this.rpms = 0;
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
    }  
    image1.src = FuturgoDashboardScript.dashboardURL;

	var image2 = new Image();  
    image2.onload = function () {  
    	that.dialImage = image2;
    }  
    image2.src = FuturgoDashboardScript.dialURL;

}

FuturgoDashboardScript.prototype.update = function()
{
	if (!this.enabled)
		return;

	this.speed += 0.05;
	if (this.speed > 1.5)
		this.speed = 0;

	this.rpms += 0.01;
	if (this.rpms > 1)
		this.rpms = 0;
	
	this.draw();
	
	// this.texture.offset.x += 0.01;
	this.texture.needsUpdate = true;	
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
	
	this.theta = -Math.PI * 3 / 4 + this.speed * Math.PI;
	this.rpmtheta = -Math.PI / 2 + this.rpms * Math.PI;
	
	if (this.dialImage) {
		context.save();
		
		context.translate(256, 175);
		context.rotate(this.theta);
		context.translate(-12, -90);
		context.drawImage(this.dialImage, 0, 0); // 198, 25, 115);  
		context.restore();

		context.save();
		
		context.translate(403, 358);
		context.rotate(this.rpmtheta);
		context.translate(-12, -90);
		context.drawImage(this.dialImage, 0, 0); // 198, 25, 115);  
		context.restore();

	}
	
}

FuturgoDashboardScript.imagePath = './models/futurgo_mobile/images/';
FuturgoDashboardScript.dashboardURL = FuturgoDashboardScript.imagePath + 'gauges.png';
FuturgoDashboardScript.dialURL = FuturgoDashboardScript.imagePath + 'dial2.png';


