BUILDDIR=../build
TARGET="$BUILDDIR/vizi-nodeps.min.js"
OUTPUT="$BUILDDIR/vizi.min.js"
#THREEDIR=../libs/three.js.r66
THREEDIR=../libs/three.js.r68
THREE="$THREEDIR/three.min.js"
STATS="$THREEDIR/stats.min.js"
LOADERS="$THREEDIR/loaders/ColladaLoader.js \
$THREEDIR/loaders/glTF/glTF-parser.js \
$THREEDIR/loaders/glTF/glTFLoader.js \
$THREEDIR/loaders/glTF/glTFLoaderUtils.js \
$THREEDIR/loaders/glTF/glTFAnimation.js \
$THREEDIR/postprocessing/EffectComposer.js \
$THREEDIR/postprocessing/FilmPass.js \
$THREEDIR/postprocessing/BloomPass.js \
$THREEDIR/postprocessing/MaskPass.js \
$THREEDIR/postprocessing/RenderPass.js \
$THREEDIR/postprocessing/ShaderPass.js \
$THREEDIR/shaders/ConvolutionShader.js \
$THREEDIR/shaders/CopyShader.js \
$THREEDIR/shaders/DotScreenShader.js \
$THREEDIR/shaders/DotScreenRGBShader.js \
$THREEDIR/shaders/FilmShader.js \
$THREEDIR/shaders/RGBShiftShader.js \
../libs/oculus/VREffect.js \
../libs/oculus/VRControls.js \
$THREEDIR/ParticleEngine/ShaderParticles.min.js"


RAF=../libs/requestAnimationFrame/RequestAnimationFrame.js
MOUSEWHEEL=../libs/jquery-mousewheel-3.0.4/jquery.mousewheel.js
TWEEN=../libs/tween.js/tween.min.js
LIBS="$THREE $STATS $LOADERS $TWEEN $RAF"
NODEPS=../src/config/nodeps.js
FLAGS='--language_in=ECMASCRIPT5'

$CLOSURE_PATH/closure/bin/build/closurebuilder.py --root=$CLOSURE_PATH  --root=../src/animations --root=../src/behaviors --root=../src/cameras --root=../src/controllers --root=../src/config --root=../src/core  --root=../src/events --root=../src/graphics --root=../src/helpers --root=../src/input --root=../src/lights  --root=../src/loaders --root=../src/objects --root=../src/particles --root=../src/postprocessing --root=../src/prefabs --root=../src/scene --root=../src/scripts --root=../src/system --root=../src/time --root=../src/viewer --namespace="Vizi" --namespace="Vizi.Object" --namespace="Vizi.Modules" --output_mode=compiled --compiler_flags=$FLAGS --compiler_jar=compiler.jar --output_file=$TARGET
cat $LIBS $NODEPS $TARGET > $OUTPUT
