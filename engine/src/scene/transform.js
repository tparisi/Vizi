/**
 *
 */
goog.provide('Vizi.Transform');
goog.require('Vizi.SceneComponent');

Vizi.Transform = function(param)
{
	param = param || {};
    Vizi.SceneComponent.call(this, param);

    this.object = new THREE.Object3D();
} ;

goog.inherits(Vizi.Transform, Vizi.SceneComponent);

Vizi.Transform.prototype._componentProperty = "transform";
Vizi.Transform.prototype._componentPropertyType = "Transform";

Vizi.Transform.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = (this._object._parent && this._object._parent.transform) ? this._object._parent.transform.object : scene;
		if (parent)
		{
		    parent.add(this.object);
		    this.object.data = this; // backpointer for picking and such
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}

Vizi.Transform.prototype.removeFromScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = (this._object._parent && this._object._parent.transform) ? this._object._parent.transform.object : scene;
		if (parent)
		{
			this.object.data = null;
		    parent.remove(this.object);
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}
