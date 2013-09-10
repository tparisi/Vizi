BUILDDIR=../build
TARGET="$BUILDDIR/vizi-nodeps.min.js"
OUTPUT="$BUILDDIR/vizi.min.js"
THREE=../libs/three.js.r58/three.min.js
STATS=../libs/three.js.r58/stats.min.js
LOADERS=../libs/three.js.r59/loaders/ColladaLoader.js
RAF=../libs/requestAnimationFrame/RequestAnimationFrame.js
MOUSEWHEEL=../libs/jquery-mousewheel-3.0.4/jquery.mousewheel.js
TWEEN=../libs/tween.js/tween.min.js
LIBS="$THREE $STATS $LOADERS $TWEEN $RAF $MOUSEWHEEL"
NODEPS=../src/config/nodeps.js
FLAGS='--language_in=ECMASCRIPT5'

$CLOSURE_PATH/closure/bin/build/closurebuilder.py --root=$CLOSURE_PATH  --root=../src/animations --root=../src/behaviors --root=../src/cameras --root=../src/controllers --root=../src/config --root=../src/core  --root=../src/events --root=../src/graphics --root=../src/input --root=../src/lights  --root=../src/loaders  --root=../src/prefabs --root=../src/scene --root=../src/scripts --root=../src/system --root=../src/time --root=../src/viewer --namespace="Vizi" --namespace="Vizi.Object" --namespace="Vizi.Modules" --output_mode=compiled --compiler_flags=$FLAGS --compiler_jar=compiler.jar --output_file=$TARGET
cat $LIBS $NODEPS $TARGET > $OUTPUT
