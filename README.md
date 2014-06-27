# Vizi

A Framework for Building Interactive 3D Applications in WebGL

## Getting Started

Download the [latest version](https://raw.githubusercontent.com/tparisi/Vizi/master/engine/build/vizi.min.js) and include it into your HTML:

```html
<script src="js/vizi.min.js"></script>
```

Note that this version is the minified release version. Checkout the [engine/build](https://github.com/tparisi/Vizi/tree/master/engine/build) directory for other versions (e.g. unminified, no-dependencies, etc.).

Create your Vizi-based application:

```html
<div id="container" style="width: 98%; height:98%; position: absolute; background-color: #000;"></div>
<script>
  // Create Vizi application
  var container = document.getElementById("container");
  var app = new Vizi.Application({ container: container });

  // Create a phong-shaded cube
  var cube = new Vizi.Object;
  var visual = new Vizi.Visual({
    geometry: new THREE.CubeGeometry(2,2,2),
    material: new THREE.MeshPhongMaterial({ color: 0xcccccc })
  });
  cube.addComponent(visual);

  // Add rotation behaviour
  var rotator = new Vizi.RotateBehavior({autoStart:true});
  cube.addComponent(rotator);

  // Rotate cube to demonstrate 3D
  cube.transform.rotation.x = Math.PI / 5;

  // Create light to show shading
  var light = new Vizi.Object;
  light.addComponent(new Vizi.DirectionalLight);

  // Add cube and light to the scene
  app.addObject(cube);
  app.addObject(light);

  // Run the app
  app.run();
</script>
```
