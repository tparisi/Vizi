(function() {
  var Controls;

  FW.Controls = Controls = (function() {
    function Controls() {
      FW.controls = new THREE.PointerLockControls(FW.camera);
      document.addEventListener('click', function(event) {
        var element, havePointerLock, pointerLockChange,
          _this = this;
        havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
        if (havePointerLock) {
          element = document.body;
          pointerLockChange = function(event) {
            if (document.pointerLockElement = element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
              return FW.controls.enabled = true;
            }
          };
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
          element.requestPointerLock();
        }
        document.addEventListener('pointerlockchange', function() {
          pointerLockChange();
          return false;
        });
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        return document.addEventListener('webkitpointerlockchange', function() {
          pointerLockChange();
          return false;
        });
      });
    }

    Controls.prototype.update = function() {
      return this.controls.update();
    };

    return Controls;

  })();

}).call(this);
