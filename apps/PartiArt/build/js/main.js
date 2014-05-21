(function() {
  var Main;

  window.$ = document.querySelectorAll.bind(document);

  Element.prototype.on = Element.prototype.addEventListener;

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  window.FW = {};

  if (typeof SC !== "undefined" && SC !== null) {
    SC.initialize({
      client_id: "7da24ca214bf72b66ed2494117d05480"
    });
  }

  FW.sfxVolume = 0.2;

  FW.globalTick = 0.16;

  window.soundOn = false;

  window.onload = function() {
    var infoEl, infoShowing;
    FW.myWorld = new FW.World();
    FW.myWorld.animate();
    FW.main = new FW.Main();
    infoEl = document.getElementsByClassName('infoWrapper')[0];
    infoShowing = false;
    return document.onclick = function(event) {
      var el;
      el = event.target;
      if (el.className === "icon") {
        infoEl.style.display = infoShowing ? 'none' : 'block';
        return infoShowing = !infoShowing;
      }
    };
  };

  FW.Main = Main = (function() {
    function Main() {
      if (soundOn) {
        SC.stream("/tracks/rameses-b-inspire", function(sound) {
          if (soundOn) {
            return sound.play();
          }
        });
      }
    }

    return Main;

  })();

}).call(this);
