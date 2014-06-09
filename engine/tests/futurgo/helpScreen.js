HelpScreenPrefab = function(param) {

	param = param || {};
	
	var obj = new Vizi.Object;

	var helpScreenScript = new HelpScreenScript();
	obj.addComponent(helpScreenScript);

	var helpScreenTexture = new THREE.ImageUtils.loadTexture(HelpScreenScript.helpScreenUrl);
	var geometry = new THREE.PlaneGeometry(4, 3);
	var material = new THREE.MeshBasicMaterial({
		map: helpScreenTexture,
		transparent:true,
	});
	var mesh = new THREE.Mesh(geometry, material);
	// mesh.rotation.x = Math.PI / 8;
	var visual = new Vizi.Visual({object:mesh});
	obj.addComponent(visual);
	
	obj.transform.position.set(0, -4, 0); // below the water
	
	var mover = new Vizi.MoveBehavior({loop:false, duration:1, moveVector:new THREE.Vector3(0, 4, 0)});
	obj.addComponent(mover);
	
	var mover = new Vizi.MoveBehavior({loop:false, duration:1, moveVector:new THREE.Vector3(0, -4, 0)});
	obj.addComponent(mover);
	
	var picker = new Vizi.Picker;
	obj.addComponent(picker);
	
	return obj;
}

HelpScreenScript = function(param) {
	this.running = false;
	this.visible = false;
}

goog.inherits(HelpScreenScript, Vizi.Script);

HelpScreenScript.prototype.realize = function() {
	this.getMovers();

	this.visual = this._object.getComponent(Vizi.Visual);
	
	var picker = this._object.getComponent(Vizi.Picker);
	var that = this;
	picker.addEventListener("dblclick", function(event) {
		that.hide();
	});
}

HelpScreenScript.prototype.getMovers = function() {
	var movers = this._object.getComponents(Vizi.MoveBehavior);
	this.upMover = movers[0];
	this.downMover = movers[1];
}

HelpScreenScript.prototype.update = function() {
}

HelpScreenScript.prototype.show = function() {
	if (this.visible)
		return;
	
	if (!this.upMover) {
		this.getMovers();
	}
	
	this.upMover.start();
	this.visual.object.visible = true;

	this.visible = true;
}

HelpScreenScript.prototype.hide = function() {
	if (!this.visible)
		return;
	
	if (!this.downMover) {
		this.getMovers();
	}
	
	this.downMover.start();
	
	var that = this;
	setTimeout(function() {
		that.visual.object.visible = false;
	}, 1000);
	
	
	this.visible = false;
}

HelpScreenScript.helpScreenUrl = "../images/futurgorifthelp.png";