// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {}; // Identifies this file as the Closure base.


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(user): The debug DOM loader was included in base.js as an orignal
// way to do "debug-mode" development.  The dependency system can sometimes
// be confusing, as can the debug DOM loader's asyncronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the
// script will not load until some point after the current script.  If a
// namespace is needed at runtime, it needs to be defined in a previous
// script, or loaded via require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = true;


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide())
 *     in the form "goog.package.part".
 */
goog.require = function(name) {

  // if the object already exists we do not need do do anything
  // TODO(user): If we start to support require based on file name this has
  //            to change
  // TODO(user): If we allow goog.foo.* this has to change
  // TODO(user): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {...*} var_args The arguments of the function.
 * @return {*} The first argument.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(var_args) {
  return arguments[0];
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor());
  };
};


if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // used when resolving dependencies to prevent us from
    // visiting the file twice
    visited: {},
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE). Does not use browser native
 * Object.propertyIsEnumerable.
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  // KJS in Safari 2 is not ECMAScript compatible and lacks crucial methods
  // such as propertyIsEnumerable.  We therefore use a workaround.
  // Does anyone know a more efficient work around?
  if (propName in object) {
    for (var key in object) {
      if (key == propName &&
          Object.prototype.hasOwnProperty.call(object, propName)) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE).
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerable_ = function(object, propName) {
  // In IE if object is from another window, cannot use propertyIsEnumerable
  // from this window's Object. Will raise a 'JScript object expected' error.
  if (object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName);
  } else {
    return goog.propertyIsEnumerableCustom_(object, propName);
  }
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == 'object' || type == 'array' || type == 'function';
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(user): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
Object.prototype.clone;


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a
 * hyphen and passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which
 * these mappings are used. In the BY_PART style, each part (i.e. in
 * between hyphens) of the passed in css name is rewritten according
 * to the map. In the BY_WHOLE style, the full css name is looked up in
 * the map directly. If a rewrite is not specified by the map, the
 * compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls
 * to goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed
 * only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Time');

Vizi.Time = function()
{
	// Freak out if somebody tries to make 2
    if (Vizi.Time.instance)
    {
        throw new Error('Graphics singleton already exists')
    }
}


Vizi.Time.prototype.initialize = function(param)
{
	this.currentTime = Date.now();

	Vizi.Time.instance = this;
}

Vizi.Time.prototype.update = function()
{
	this.currentTime = Date.now();
}

Vizi.Time.instance = null;
	        
/**
 * @author Tony Parisi
 */
goog.provide('Vizi.Service');

/**
 * Interface for a Service.
 *
 * Allows multiple different backends for the same type of service.
 * @interface
 */
Vizi.Service = function() {};

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the Service - Abstract.
 */
Vizi.Service.prototype.initialize = function(param) {};

/**
 * Terminates the Service - Abstract.
 */
Vizi.Service.prototype.terminate = function() {};


/**
 * Updates the Service - Abstract.
 */
Vizi.Service.prototype.update = function() {};/**
 *
 */
goog.require('Vizi.Service');
goog.provide('Vizi.EventService');

/**
 * The EventService.
 *
 * @extends {Vizi.Service}
 */
Vizi.EventService = function() {};

goog.inherits(Vizi.EventService, Vizi.Service);

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the events system.
 */
Vizi.EventService.prototype.initialize = function(param) {};

/**
 * Terminates the events world.
 */
Vizi.EventService.prototype.terminate = function() {};


/**
 * Updates the EventService.
 */
Vizi.EventService.prototype.update = function()
{
	do
	{
		Vizi.EventService.eventsPending = false;
		Vizi.Application.instance.updateObjects();
	}
	while (Vizi.EventService.eventsPending);
}/**
 * @fileoverview EventDispatcher is the base class for any object that sends/receives messages
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.EventDispatcher');
goog.require('Vizi.EventService');
goog.require('Vizi.Time');

/**
 * @constructor
 */
Vizi.EventDispatcher = function() {
    this.eventTypes = {};
    this.timestamps = {};
    this.connections = {};
}

Vizi.EventDispatcher.prototype.addEventListener = function(type, listener) {
    var listeners = this.eventTypes[type];
    if (listeners)
    {
        if (listeners.indexOf(listener) != -1)
        {
            return;
        }
    }
    else
    {
    	listeners = [];
        this.eventTypes[type] = listeners;
        this.timestamps[type] = 0;
    }

    listeners.push(listener);
}

Vizi.EventDispatcher.prototype.removeEventListener =  function(type, listener) {
    if (listener)
    {
        var listeners = this.eventTypes[type];

        if (listeners)
        {
            var i = listeners.indexOf(listener);
            if (i != -1)
            {
            	listeners.splice(i, 1);
            }
        }
    }
    else
    {
        delete this.eventTypes[type];
        delete this.timestamps[type];
    }
}

Vizi.EventDispatcher.prototype.dispatchEvent = function(type) {
    var listeners = this.eventTypes[type];

    if (listeners)
    {
    	var now = Vizi.Time.instance.currentTime;
    	
    	if (this.timestamps[type] < now)
    	{
    		this.timestamps[type] = now;
	    	Vizi.EventService.eventsPending = true;
	    	
    		[].shift.call(arguments);
	    	for (var i = 0; i < listeners.length; i++)
	        {
                listeners[i].apply(this, arguments);
	        }
    	}
    }
}

Vizi.EventDispatcher.prototype.hasEventListener = function (subscribers, subscriber) {
    var listeners = this.eventTypes[type];
    if (listeners)
        return (listeners.indexOf(listener) != -1)
    else
    	return false;
}

Vizi.EventDispatcher.prototype.connect = function(type, target, targetProp) {
    var connections = this.connections[type];
    if (connections)
    {
    	/*
        if (connections.indexOf(target) != -1)
        {
            return;
        }
        */
    }
    else
    {
    	connections = [];
        this.connections[type] = connections;
    }

    var that = this;
    var listener = (function() { return function() { that.handleConnection(null, target, targetProp, arguments); } }) ();
    var connection = { listener : listener, sourceProp : null, target : target, 
    		targetProp : targetProp };
    connections.push(connection);
    var connection = this.addEventListener(type, listener);
}

Vizi.EventDispatcher.prototype.handleConnection = function(sourceProp, target, targetProp, args) {
	var targetValue = target[targetProp];
	
	if (typeof targetValue == "function") {
		targetValue.apply(target, args);
	}
	else if (typeof targetValue == "object") {
		if (targetValue.copy && typeof targetValue.copy == "function") {
			targetValue.copy(sourceProp ? args[0][sourceProp] : args[0]);
			}
	}
	else {
		target[targetProp] = sourceProp ? args[0][sourceProp] : args[0];
	}
}

    /**
 * @fileoverview Object collects a group of Components that define an object and its behaviors
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Object');
goog.require('Vizi.EventDispatcher');

/**
 * Creates a new Object.
 * @constructor
 * @extends {Vizi.EventDispatcher}
 */
Vizi.Object = function(param) {
    Vizi.EventDispatcher.call(this);
    
    /**
     * @type {number}
     * @private
     */
    this._id = Vizi.Object.nextId++;

    /**
     * @type {Vizi.Object}
     * @private
     */
    this._parent = null;

    /**
     * @type {Array.<Vizi.Object>}
     * @private
     */
    this._children = [];

    /**
     * @type {Array}
     * @private
     */
    this._components = [];
    
    
    /**
     * @type {Boolean}
     * @private
     */
    this._realized = false;
    
    // Automatically create a transform component unless the caller says not to 
    var autoCreateTransform = true;
    if (param && param.autoCreateTransform !== undefined)
    	autoCreateTransform = param.autoCreateTransform;
    
	if (autoCreateTransform)
	{
		this.addComponent(new Vizi.Transform);
	}
}

goog.inherits(Vizi.Object, Vizi.EventDispatcher);

/**
 * The next identifier to hand out.
 * @type {number}
 * @private
 */
Vizi.Object.nextId = 0;

Vizi.Object.prototype.getID = function() {
    return this._id;
}

//---------------------------------------------------------------------
// Hierarchy methods
//---------------------------------------------------------------------

/**
 * Sets the parent of the Object.
 * @param {Vizi.Object} parent The parent of the Object.
 * @private
 */
Vizi.Object.prototype.setParent = function(parent) {
    this._parent = parent;
}

/**
 * Adds a child to the Object.
 * @param {Vizi.Object} child The child to add.
 */
Vizi.Object.prototype.addChild = function(child) {
    if (!child)
    {
        throw new Error('Cannot add a null child');
    }

    if (child._parent)
    {
        throw new Error('Child is already attached to an Object');
    }

    child.setParent(this);
    this._children.push(child);

    if (this._realized && !child._realized)
    {
    	child.realize();
    }

}

/**
 * Removes a child from the Object
 * @param {Vizi.Object} child The child to remove.
 */
Vizi.Object.prototype.removeChild = function(child) {
    var i = this._children.indexOf(child);

    if (i != -1)
    {
        this._children.splice(i, 1);
        child.setParent(null);
    }
}

/**
 * Removes a child from the Object
 * @param {Vizi.Object} child The child to remove.
 */
Vizi.Object.prototype.getChild = function(index) {
	if (index >= this._children.length)
		return null;
	
	return this._children[index];
}

//---------------------------------------------------------------------
// Component methods
//---------------------------------------------------------------------

/**
 * Adds a Component to the Object.
 * @param {Vizi.Component} component.
 */
Vizi.Object.prototype.addComponent = function(component) {
    if (!component)
    {
        throw new Error('Cannot add a null component');
    }
    
    if (component._object)
    {
        throw new Error('Component is already attached to an Object')
    }

    var proto = Object.getPrototypeOf(component);
    if (proto._componentProperty)
    {
    	if (this[proto._componentProperty])
    	{
    		var t = proto._componentPropertyType;
            Vizi.System.warn('Object already has a ' + t + ' component');
            return;
    	}
    	
    	this[proto._componentProperty] = component;
    }

    if (proto._componentCategory)
    {
    	if (!this[proto._componentCategory])
    		this[proto._componentCategory] = [];
    	
    	this[proto._componentCategory].push(component);
    }
    
    this._components.push(component);
    component.setObject(this);
    
    if (this._realized && !component._realized)
    {
    	component.realize();
    }
}

/**
 * Removes a Component from the Object.
 * @param {Vizi.Component} component.
 */
Vizi.Object.prototype.removeComponent = function(component) {
    var i = this._components.indexOf(component);

    if (i != -1)
    {
    	if (component.removeFromScene)
    	{
    		component.removeFromScene();
    	}
    	
        this._components.splice(i, 1);
        component.setObject(null);
    }
}

/**
 * Retrieves a Component of a given type in the Object.
 * @param {Object} type.
 */
Vizi.Object.prototype.getComponent = function(type) {
	var i, len = this._components.length;
	
	for (i = 0; i < len; i++)
	{
		var component = this._components[i];
		if (component instanceof type)
		{
			return component;
		}
	}
	
	return null;
}

/**
 * Retrieves a Component of a given type in the Object.
 * @param {Object} type.
 */
Vizi.Object.prototype.getComponents = function(type) {
	var i, len = this._components.length;
	
	var components = [];
	
	for (i = 0; i < len; i++)
	{
		var component = this._components[i];
		if (component instanceof type)
		{
			components.push(component);
		}
	}
	
	return components;
}

//---------------------------------------------------------------------
//Initialize methods
//---------------------------------------------------------------------

Vizi.Object.prototype.realize = function() {
    this.realizeComponents();
    this.realizeChildren();
        
    this._realized = true;
}

/**
 * @private
 */
Vizi.Object.prototype.realizeComponents = function() {
    var component;
    var count = this._components.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._components[i].realize();
    }
}

/**
 * @private
 */
Vizi.Object.prototype.realizeChildren = function() {
    var child;
    var count = this._children.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._children[i].realize();
    }
}

//---------------------------------------------------------------------
// Update methods
//---------------------------------------------------------------------

Vizi.Object.prototype.update = function() {
    this.updateComponents();
    this.updateChildren();
}

/**
 * @private
 */
Vizi.Object.prototype.updateComponents = function() {
    var component;
    var count = this._components.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._components[i].update();
    }
}

/**
 * @private
 */
Vizi.Object.prototype.updateChildren = function() {
    var child;
    var count = this._children.length;
    var i = 0;

    for (; i < count; ++i)
    {
        this._children[i].update();
    }
}

//---------------------------------------------------------------------
// Traversal and query methods
//---------------------------------------------------------------------

Vizi.Object.prototype.traverse = function (callback) {

	callback(this);

    var i, count = this._children.length;
	for (i = 0; i < count ; i ++ ) {

		this._children[ i ].traverse( callback );
	}
}

Vizi.Object.prototype.findCallback = function(n, query, found) {
	if (typeof(query) == "string")
	{
		if (n.name == query)
			found.push(n);
	}
	else if (query instanceof RegExp)
	{
		var match  = n.name.match(query);
		if (match && match.length)
			found.push(n);
	}
	else if (query instanceof Function) {
		if (n instanceof query)
			found.push(n);
		else {
			var components = n.getComponents(query);
			var i, len = components.length;
			for (i = 0; i < len; i++)
				found.push(components[i]);
		}
	}
}

Vizi.Object.prototype.findNode = function(str) {
	var that = this;
	var found = [];
	this.traverse(function (o) { that.findCallback(o, str, found); });
	
	return found[0];
}

Vizi.Object.prototype.findNodes = function(query) {
	var that = this;
	var found = [];
	this.traverse(function (o) { that.findCallback(o, query, found); });
	
	return found;
}

Vizi.Object.prototype.map = function(query, callback){
	var found = this.findNodes(query);
	var i, len = found.length;
	
	for (i = 0; i < len; i++) {
		callback(found[i]);
	}
}
/**
 *
 */
goog.provide('Vizi.Mouse');

Vizi.Mouse = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	this.state = 
	{ x : Vizi.Mouse.NO_POSITION, y: Vizi.Mouse.NO_POSITION,

	buttons : { left : false, middle : false, right : false },
	scroll : 0,
	};

	Vizi.Mouse.instance = this;
};

Vizi.Mouse.prototype.onMouseMove = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
}

Vizi.Mouse.prototype.onMouseDown = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = true;
}

Vizi.Mouse.prototype.onMouseUp = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = false;	            
}

Vizi.Mouse.prototype.onMouseScroll = function(event, delta)
{
    this.state.scroll = 0; // PUNT!
}


Vizi.Mouse.prototype.getState = function()
{
	return this.state;
}

Vizi.Mouse.instance = null;
Vizi.Mouse.NO_POSITION = Number.MIN_VALUE;
/**
 * @fileoverview Contains prefab assemblies for core Vizi package
 * @author Tony Parisi
 */
goog.provide('Vizi.Prefabs');/**
 * @fileoverview Component is the base class for defining capabilities used within an Object
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Component');
goog.require('Vizi.EventDispatcher');

/**
 * Creates a new Component.
 * @constructor
 */
Vizi.Component = function(param) {
    Vizi.EventDispatcher.call(this);
	
	param = param || {};

    /**
     * @type {Vizi.Object}
     * @private
     */
    this._object = null;
    
    /**
     * @type {Boolean}
     * @private
     */
    this._realized = false;
}

goog.inherits(Vizi.Component, Vizi.EventDispatcher);

/**
 * Gets the Object the Component is associated with.
 * @returns {Vizi.Object} The Object the Component is associated with.
 */
Vizi.Component.prototype.getObject = function() {
    return this._object;
}

/**
 * Sets the Object the Component is associated with.
 * @param {Vizi.Object} object
 */
Vizi.Component.prototype.setObject = function(object) {
    this._object = object;
}

Vizi.Component.prototype.realize = function() {
    this._realized = true;
}

Vizi.Component.prototype.update = function() {
}
/**
 * @fileoverview Timer - component that generates time events
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Timer');
goog.require('Vizi.Component');

Vizi.Timer = function(param)
{
    Vizi.Component.call(this);
    param = param || {};
    
    this.currentTime = Vizi.Time.instance.currentTime;
    this.running = false;
    this.duration = param.duration ? param.duration : 0;
    this.loop = param.loop;
    this.lastFraction = 0;
}

goog.inherits(Vizi.Timer, Vizi.Component);

Vizi.Timer.prototype.update = function()
{
	if (!this.running)
		return;
	
	var now = Vizi.Time.instance.currentTime;
	var deltat = now - this.currentTime;
	
	if (deltat)
	{
	    this.dispatchEvent("time", now);		
	}
	
	if (this.duration)
	{
		var mod = now % this.duration;
		var fract = mod / this.duration;
		
		this.dispatchEvent("fraction", fract);
		
		if (fract < this.lastFraction)
		{
			this.dispatchEvent("cycleTime");
			
			if (!this.loop)
			{
				this.stop();
			}
		}
		
		this.lastFraction = fract;
	}
	
	this.currentTime = now;
	
}

Vizi.Timer.prototype.start = function()
{
	this.running = true;
}

Vizi.Timer.prototype.stop = function()
{
	this.running = false;
}

/**
 * @fileoverview Base class for visual elements.
 * @author Tony Parisi
 */
goog.provide('Vizi.SceneComponent');
goog.require('Vizi.Component');

/**
 * @constructor
 */
Vizi.SceneComponent = function(param)
{	
	param = param || {};

	Vizi.Component.call(this, param);
    
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        position: {
	        get: function() {
	            return this.object.position;
	        }
    	},
        rotation: {
	        get: function() {
	            return this.object.rotation;
	        }
    	},
        scale: {
	        get: function() {
	            return this.object.scale;
	        }
    	},
        quaternion: {
	        get: function() {
	            return this.object.quaternion;
	        }
    	},    	
        useQuaternion: {
	        get: function() {
	            return this.object.useQuaternion;
	        },
	        set: function(v) {
	            this.object.useQuaternion = v;
	        }
    	},    	

    });
    
    this.layer = param.layer;
} ;

goog.inherits(Vizi.SceneComponent, Vizi.Component);

Vizi.SceneComponent.prototype.realize = function()
{
	if (this.object && !this.object.data)
	{
		this.addToScene();
	}
	
	Vizi.Component.prototype.realize.call(this);
}

Vizi.SceneComponent.prototype.update = function()
{	
	Vizi.Component.prototype.update.call(this);
}

Vizi.SceneComponent.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object) {
		
		// only add me if the object's transform component actually points
		// to a different Three.js object than mine
		if (this._object.transform.object != this.object) {

			var parent = this._object.transform ? this._object.transform.object : scene;
			
			if (parent) {
			    parent.add(this.object);
			    this.object.data = this; // backpointer for picking and such
			}
			else {
				// N.B.: throw something?
			}
		}
	}
	else {
		// N.B.: throw something?
	}
}

Vizi.SceneComponent.prototype.removeFromScene = function() {
	var scene = this.layer ? this.layer.scene : Vizi.Graphics.instance.scene;
	if (this._object)
	{
		var parent = this._object.transform ? this._object.transform.object : scene;
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
/**
 *
 */
goog.provide('Vizi.Transform');
goog.require('Vizi.SceneComponent');

Vizi.Transform = function(param) {
	param = param || {};
    Vizi.SceneComponent.call(this, param);

    if (param.object) {
		this.object = param.object;    	
    }
    else {
    	this.object = new THREE.Object3D();
    }
}

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
/**
 * @fileoverview Behavior component - base class for time-based behaviors
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Behavior');
goog.require('Vizi.Component');

Vizi.Behavior = function(param) {
	param = param || {};
	this.startTime = 0;
	this.running = false;
	this.loop = (param.loop !== undefined) ? param.loop : false;
	this.autoStart = (param.autoStart !== undefined) ? param.autoStart : false;
    Vizi.Component.call(this, param);
}

goog.inherits(Vizi.Behavior, Vizi.Component);

Vizi.Behavior.prototype._componentCategory = "behaviors";

Vizi.Behavior.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	
	if (this.autoStart)
		this.start();
}

Vizi.Behavior.prototype.start = function()
{
	this.startTime = Vizi.Time.instance.currentTime;
	this.running = true;
}

Vizi.Behavior.prototype.stop = function()
{
	this.startTime = 0;
	this.running = false;
}

Vizi.Behavior.prototype.toggle = function()
{
	if (this.running)
		this.stop();
	else
		this.start();
}

Vizi.Behavior.prototype.update = function()
{
	if (this.running)
	{
		// N.B.: soon, add logic to subtract suspend times
		var now = Vizi.Time.instance.currentTime;
		var elapsedTime = (now - this.startTime) / 1000;
		
		this.evaluate(elapsedTime);
	}
}

Vizi.Behavior.prototype.evaluate = function(t)
{
	if (Vizi.Behavior.WARN_ON_ABSTRACT)
		Vizi.System.warn("Abstract Behavior.evaluate called");
}

Vizi.Behavior.WARN_ON_ABSTRACT = true;
goog.provide('Vizi.Light');
goog.require('Vizi.SceneComponent');

Vizi.Light = function(param)
{
	param = param || {};
	Vizi.SceneComponent.call(this, param);
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        color: {
	        get: function() {
	            return this.object.color;
	        }
    	},
        intensity: {
	        get: function() {
	            return this.object.intensity;
	        },
	        set: function(v) {
	        	this.object.intensity = v;
	        }
    	},    	

    });
	
}

goog.inherits(Vizi.Light, Vizi.SceneComponent);

Vizi.Light.prototype._componentProperty = "light";
Vizi.Light.prototype._componentPropertyType = "Light";

Vizi.Light.prototype.realize = function() 
{
	Vizi.SceneComponent.prototype.realize.call(this);
}

Vizi.Light.DEFAULT_COLOR = 0xFFFFFF;
Vizi.Light.DEFAULT_INTENSITY = 1;
Vizi.Light.DEFAULT_RANGE = 10000;goog.provide('Vizi.PointLight');
goog.require('Vizi.Light');

Vizi.PointLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);
	
	if (param.object) {
		this.object = param.object; 
	}
	else {
		var distance = ( param.distance !== undefined ) ? param.distance : Vizi.PointLight.DEFAULT_DISTANCE;
		this.object = new THREE.PointLight(param.color, param.intensity, distance);
	}
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        distance: {
	        get: function() {
	            return this.object.distance;
	        },
	        set: function(v) {
	        	this.object.distance = v;
	        }
    	},    	

    });

}

goog.inherits(Vizi.PointLight, Vizi.Light);

Vizi.PointLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.PointLight.prototype.update = function() 
{
	if (this.object)
	{
		var worldmat = this.object.parent.matrixWorld;
		this.position.applyMatrix4(worldmat);
	}
	
	// Update the rest
	Vizi.Light.prototype.update.call(this);
}

Vizi.PointLight.DEFAULT_DISTANCE = 0;
/**
 * @fileoverview Base class for visual elements.
 * @author Tony Parisi
 */
goog.provide('Vizi.Visual');
goog.require('Vizi.SceneComponent');

/**
 * @constructor
 */
Vizi.Visual = function(param)
{
	param = param || {};
	
	Vizi.SceneComponent.call(this, param);

	if (param.object) {
		this.object = param.object;
		this.geometry = this.object.geometry;
		this.material = this.object.material;
	}
	else {
		this.geometry = param.geometry;
		this.material = param.material;
	}
}

goog.inherits(Vizi.Visual, Vizi.SceneComponent);

Vizi.Visual.prototype._componentProperty = "visual";
Vizi.Visual.prototype._componentPropertyType = "Visual";

Vizi.Visual.prototype.realize = function()
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	if (this.object) {
		this.addToScene();
	}
	else if (this.geometry && this.material) {
		this.object = new THREE.Mesh(this.geometry, this.material);
	    this.addToScene();
	}	
}

/**
 * @fileoverview A visual containing a model in Collada format
 * @author Tony Parisi
 */
goog.provide('Vizi.SceneVisual');
goog.require('Vizi.Visual');

Vizi.SceneVisual = function(param) 
{
	param = param || {};
	
    Vizi.Visual.call(this, param);

    this.object = param.scene;
}

goog.inherits(Vizi.SceneVisual, Vizi.Visual);

Vizi.SceneVisual.prototype.realize = function()
{
	Vizi.Visual.prototype.realize.call(this);
	
    this.addToScene();
}
/**
 *
 */
goog.provide('Vizi.Keyboard');

Vizi.Keyboard = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	Vizi.Keyboard.instance = this;
}

Vizi.Keyboard.prototype.onKeyDown = function(event)
{
}

Vizi.Keyboard.prototype.onKeyUp = function(event)
{
}

Vizi.Keyboard.prototype.onKeyPress = function(event)
{
}	        

Vizi.Keyboard.instance = null;

/* key codes
37: left
38: up
39: right
40: down
*/
Vizi.Keyboard.KEY_LEFT  = 37;
Vizi.Keyboard.KEY_UP  = 38;
Vizi.Keyboard.KEY_RIGHT  = 39;
Vizi.Keyboard.KEY_DOWN  = 40;
/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Graphics');

Vizi.Graphics = function()
{
	// Freak out if somebody tries to make 2
    if (Vizi.Graphics.instance)
    {
        throw new Error('Graphics singleton already exists')
    }
	
	Vizi.Graphics.instance = this;
}
	        
Vizi.Graphics.instance = null;
/**
 * @fileoverview MoveBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.MoveBehavior');
goog.require('Vizi.Behavior');

Vizi.MoveBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.moveVector = (param.moveVector !== undefined) ? param.moveVector : new THREE.Vector3(0, 1, 0);
	this.tween = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.MoveBehavior, Vizi.Behavior);

Vizi.MoveBehavior.prototype.start = function()
{
	if (this.running)
		return;

	this.movePosition = new THREE.Vector3;
	this.moveEndPosition = this.moveVector.clone();
	this.prevMovePosition = new THREE.Vector3;
	this.moveDelta = new THREE.Vector3;
	this.tween = new TWEEN.Tween(this.movePosition).to(this.moveEndPosition, this.duration * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.MoveBehavior.prototype.evaluate = function(t)
{
	if (t >= this.duration)
	{
		this.stop();
		if (this.loop)
			this.start();
	}
	
	this.moveDelta.copy(this.movePosition).sub(this.prevMovePosition);
	this.prevMovePosition.copy(this.movePosition);
	this._object.transform.position.add(this.moveDelta);
}


Vizi.MoveBehavior.prototype.stop = function()
{
	if (this.tween)
		this.tween.stop();
	
	Vizi.Behavior.prototype.stop.call(this);
}/**
 * @fileoverview Pick Manager - singleton to manage currently picked object(s)
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PickManager');

Vizi.PickManager.handleMouseMove = function(event)
{
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseMove)
    {
		Vizi.PickManager.clickedObject.onMouseMove(event);
    }
    else
    {
        var oldObj = Vizi.PickManager.overObject;
        Vizi.PickManager.overObject = Vizi.PickManager.objectFromMouse(event);

        if (Vizi.PickManager.overObject != oldObj)
        {
    		if (oldObj)
    		{
    			Vizi.Graphics.instance.setCursor(null);
    			
    			if (oldObj.onMouseOut)
                {
    				event.type = "mouseout";
                    oldObj.onMouseOut(event);
                }
    		}

            if (Vizi.PickManager.overObject)
            {            	
	        	if (Vizi.PickManager.overObject.overCursor)
	        	{
	        		Vizi.Graphics.instance.setCursor(Vizi.PickManager.overObject.overCursor);
	        	}
	        	
	        	if (Vizi.PickManager.overObject.onMouseOver)
	        	{
	        		event.type = "mouseover";
	        		Vizi.PickManager.overObject.onMouseOver(event);
	        	}
            }
        }
    }
}

Vizi.PickManager.handleMouseDown = function(event)
{
    Vizi.PickManager.clickedObject = Vizi.PickManager.objectFromMouse(event);
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseDown)
    {
        Vizi.PickManager.clickedObject.onMouseDown(event);
    }
}

Vizi.PickManager.handleMouseUp = function(event)
{
    if (Vizi.PickManager.clickedObject && Vizi.PickManager.clickedObject.onMouseUp)
    {
		Vizi.PickManager.clickedObject.onMouseUp(event);
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.handleMouseScroll = function(event)
{
    if (Vizi.PickManager.overObject && Vizi.PickManager.overObject.onMouseScroll)
    {
        Vizi.PickManager.overObject.onMouseScroll(event);
    }

    Vizi.PickManager.clickedObject = null;
}

Vizi.PickManager.objectFromMouse = function(event)
{
	var intersected = Vizi.Graphics.instance.objectFromMouse(event);
	if (intersected.object)
	{
		event.normal = intersected.normal;
		event.point = intersected.point;
		event.object = intersected.object;
		
    	if (intersected.object._object.picker)
    	{
    		return intersected.object._object.picker;
    	}
    	else
    	{
    		return Vizi.PickManager.findObjectPicker(intersected.object.object);
    	}
	}
	else
	{
		return null;
	}
}

Vizi.PickManager.findObjectPicker = function(object)
{
	while (object)
	{
		if (object.data && object.data._object.picker)
		{
			return object.data._object.picker;
		}
		else
		{
			object = object.parent;
		}
	}
	
	return null;
}


Vizi.PickManager.clickedObject = null;
Vizi.PickManager.overObject  =  null;goog.provide('Vizi.AmbientLight');
goog.require('Vizi.Light');

Vizi.AmbientLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
	}
	else {
		this.object = new THREE.AmbientLight(param.color);
	}
}

goog.inherits(Vizi.AmbientLight, Vizi.Light);

Vizi.AmbientLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}
/**
 *
 */
goog.provide('Vizi.Input');
goog.require('Vizi.Service');
goog.require('Vizi.Mouse');
goog.require('Vizi.Keyboard');

Vizi.Input = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	this.mouse = new Vizi.Mouse();
	this.keyboard = new Vizi.Keyboard();
	Vizi.Input.instance = this;
}

goog.inherits(Vizi.Input, Vizi.Service);

Vizi.Input.instance = null;/**
 * @fileoverview RotateBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.RotateBehavior');
goog.require('Vizi.Behavior');

Vizi.RotateBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.velocity = (param.velocity !== undefined) ? param.velocity : (Math.PI / 2 / this.duration);
	this.startAngle = 0;
	this.angle = 0;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.RotateBehavior, Vizi.Behavior);

Vizi.RotateBehavior.prototype.start = function()
{
	this.angle = 0;
	this._object.transform.rotation.y = this._object.transform.rotation.y % (Math.PI * 2);
	this.startAngle = this._object.transform.rotation.y;
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.RotateBehavior.prototype.evaluate = function(t)
{
	var twopi = Math.PI * 2;
	this.angle = this.velocity * t;
	if (this.angle >= twopi)
	{
		if (this.once) 
			this.angle = twopi;
		else
			this.angle = this.angle % twopi;
	}
		
	this._object.transform.rotation.y = this.startAngle + this.angle;
	
	if (this.once && this.angle >= twopi)
	{
		this.stop();
	}
}/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 */

/* Hacked-up version of Three.js orbit controls for Skybox
 * Adds mode for one-button operation and optional userMinY
 * 
 */

goog.provide('Vizi.OrbitControls');

Vizi.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center )

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be betwee EPS and PI-EPS

		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length();
		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );
		offset.multiplyScalar( scale );

		// Keep y above userMinY if defined
		var newposition = new THREE.Vector3;
		newposition.copy( this.center ).add( offset );
		if (this.userMinY === undefined || newposition.y >= this.userMinY)
		{
			var center2newpos = newposition.clone().sub(this.center);
			var dist = center2newpos.length();
			
			if (this.userMinZoom === undefined || dist >= this.userMinZoom)
			{
				if (this.userMaxZoom === undefined || dist <= this.userMaxZoom)
				{
					position.copy( this.center ).add( offset );
				}
			}
		}
		
		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.sub( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		event.preventDefault();

		// WebKit: wheelDeltaY; Moz: -deltaY
		var wheelDelta = (event.wheelDeltaY !== undefined) ? event.wheelDeltaY : -event.deltaY;
		
		// Gecko - old, use event.detail
		if ( event.detail ) { wheelDelta = -event.detail/3; }

		if ( wheelDelta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'wheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false );

};


Vizi.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.require('Vizi.Graphics');
goog.provide('Vizi.GraphicsThreeJS');

Vizi.GraphicsThreeJS = function()
{
	Vizi.Graphics.call(this);
}

goog.inherits(Vizi.GraphicsThreeJS, Vizi.Graphics);

Vizi.GraphicsThreeJS.prototype.initialize = function(param)
{
	param = param || {};
	
	// call all the setup functions
	this.initOptions(param);
	this.initPageElements(param);
	this.initScene();
	this.initRenderer(param);
	this.initMouse();
	this.initKeyboard();
	this.addDomHandlers();
}

Vizi.GraphicsThreeJS.prototype.focus = function()
{
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}

Vizi.GraphicsThreeJS.prototype.initOptions = function(param)
{
	this.displayStats = (param && param.displayStats) ? 
			param.displayStats : Vizi.GraphicsThreeJS.default_display_stats;
}

Vizi.GraphicsThreeJS.prototype.initPageElements = function(param)
{
    if (param.container)
    {
    	this.container = param.container;
    }
   	else
   	{
		this.container = document.createElement( 'div' );
	    document.body.appendChild( this.container );
   	}

    this.saved_cursor = this.container.style.cursor;
    
    if (this.displayStats)
    {
    	if (window.Stats)
    	{
	        var stats = new Stats();
	        stats.domElement.style.position = 'absolute';
	        stats.domElement.style.top = '0px';
	        stats.domElement.style.left = '0px';
	        stats.domElement.style.height = '40px';
	        this.container.appendChild( stats.domElement );
	        this.stats = stats;
    	}
    	else
    	{
    		Vizi.System.warn("No Stats module found. Make sure to include stats.min.js");
    	}
    }
}

Vizi.GraphicsThreeJS.prototype.initScene = function()
{
    var scene = new THREE.Scene();

//    scene.add( new THREE.AmbientLight(0xffffff) ); //  0x505050 ) ); // 
	
    var camera = new THREE.PerspectiveCamera( 45, 
    		this.container.offsetWidth / this.container.offsetHeight, 1, 4000 );
    camera.position.copy(Vizi.Camera.DEFAULT_POSITION);

    scene.add(camera);
    
    this.scene = scene;
	this.camera = camera;
	
	this.backgroundLayer = {};
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, 
    		this.container.offsetWidth / this.container.offsetHeight, 1, 4000 );
    camera.position.set( 0, 0, 10 );	
    scene.add(camera);
    
    this.backgroundLayer.scene = scene;
    this.backgroundLayer.camera = camera;
}

Vizi.GraphicsThreeJS.prototype.initRenderer = function(param)
{
    var renderer = // Vizi.Config.USE_WEBGL ?
    	new THREE.WebGLRenderer( { antialias: true } ); // :
    	// new THREE.CanvasRenderer;
    	
    renderer.sortObjects = false;
    renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );

    if (param && param.backgroundColor)
    {
    	renderer.domElement.style.backgroundColor = param.backgroundColor;
    	renderer.domElement.setAttribute('z-index', -1);
    }
    
    this.container.appendChild( renderer.domElement );

    var projector = new THREE.Projector();

    this.renderer = renderer;
    this.projector = projector;

    this.lastFrameTime = 0;
}

Vizi.GraphicsThreeJS.prototype.initMouse = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false );
	
	$(dom).mousewheel(
	        function(e, delta) {
	            that.onDocumentMouseScroll(e, delta);
	        }
	    );
	
}

Vizi.GraphicsThreeJS.prototype.initKeyboard = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    
}

Vizi.GraphicsThreeJS.prototype.addDomHandlers = function()
{
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}

Vizi.GraphicsThreeJS.prototype.objectFromMouse = function(event)
{
	var eltx = event.elementX, elty = event.elementY;
	
	// translate client coords into vp x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);
	
    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObjects( this.scene.children, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	
    	if (i >= intersects.length)
    	{
        	return { object : null, point : null, normal : null };
    	}
    	
    	return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal));        	    	                             
    }
    else
    {
    	return { object : null, point : null, normal : null };
    }
}

Vizi.GraphicsThreeJS.prototype.findObjectFromIntersected = function(object, point, normal)
{
	if (object.data)
	{
		var modelMat = new THREE.Matrix4;
		modelMat.getInverse(object.matrixWorld);
		var hitPointWorld = point.clone();
		point.applyMatrix4(modelMat);
		return { object: object.data, point: point, hitPointWorld : hitPointWorld, normal: normal };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point, normal);
	}
	else
	{
		return { object : null, point : null, normal : null };
	}
}

Vizi.GraphicsThreeJS.prototype.nodeFromMouse = function(event)
{
	// Blerg, this is to support code outside the SB components & picker framework
	// Returns a raw Three.js node
	
	// translate client coords into vp x,y
	var eltx = event.elementX, elty = event.elementY;
	
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);

    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObjects( this.scene.children, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	if (intersected)
    	{
    		return { node : intersected.object, 
    				 point : intersected.point, 
    				 normal : intersected.face.normal
    				}
    	}
    	else
    		return null;
    }
    else
    {
    	return null;
    }
}

Vizi.GraphicsThreeJS.prototype.getObjectIntersection = function(x, y, object)
{
	// Translate client coords into viewport x,y
	var vpx = ( x / this.renderer.domElement.offsetWidth ) * 2 - 1;
	var vpy = - ( y / this.renderer.domElement.offsetHeight ) * 2 + 1;
	
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);
	
    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObject( object, true );
	if (intersects.length)
	{
		var intersection = intersects[0];
		var modelMat = new THREE.Matrix4;
		modelMat.getInverse(intersection.object.matrixWorld);
		intersection.point.applyMatrix4(modelMat);
		return intersection;
	}
	else
		return null;
		
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseMove = function(event)
{
    event.preventDefault();
    
	var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty };
	
    Vizi.Mouse.instance.onMouseMove(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseMove(evt);
    }
    
    Vizi.Application.handleMouseMove(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseDown = function(event)
{
    event.preventDefault();
    
	var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty };
	
    Vizi.Mouse.instance.onMouseDown(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseDown(evt);
    }
    
    Vizi.Application.handleMouseDown(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseUp = function(event)
{
    event.preventDefault();

    var offset = $(this.renderer.domElement).offset();
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty };
    
    Vizi.Mouse.instance.onMouseUp(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseUp(evt);
    }	            

    Vizi.Application.handleMouseUp(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseScroll = function(event, delta)
{
    event.preventDefault();

    var evt = { type : "mousescroll", delta : delta };
    
    Vizi.Mouse.instance.onMouseScroll(evt);

    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseScroll(evt);
    }
    
    Vizi.Application.handleMouseScroll(evt);
}

Vizi.GraphicsThreeJS.prototype.onKeyDown = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyDown(event);
    
	Vizi.Application.handleKeyDown(event);
}

Vizi.GraphicsThreeJS.prototype.onKeyUp = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyUp(event);
    
	Vizi.Application.handleKeyUp(event);
}
	        
Vizi.GraphicsThreeJS.prototype.onKeyPress = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyPress(event);
    
	Vizi.Application.handleKeyPress(event);
}

Vizi.GraphicsThreeJS.prototype.onWindowResize = function(event)
{
	this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

	if (Vizi.CameraManager && Vizi.CameraManager.handleWindowResize(this.container.offsetWidth, this.container.offsetHeight))
	{		
	}
	else
	{
		this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
		this.camera.updateProjectionMatrix();
	}
}

Vizi.GraphicsThreeJS.prototype.setCursor = function(cursor)
{
	if (!cursor)
		cursor = this.saved_cursor;
	
	this.container.style.cursor = cursor;
}


Vizi.GraphicsThreeJS.prototype.update = function()
{
    this.renderer.setClearColor( 0, 0 );
	this.renderer.autoClearColor = true;
    this.renderer.render( this.backgroundLayer.scene, this.backgroundLayer.camera );
    this.renderer.setClearColor( 0, 1 );
	this.renderer.autoClearColor = false;
    this.renderer.render( this.scene, this.camera );

    var frameTime = Date.now();
    var deltat = (frameTime - this.lastFrameTime) / 1000;
    this.frameRate = 1 / deltat;

    this.lastFrameTime = frameTime;
    	
    if (this.stats)
    {
    	this.stats.update();
    }
}

Vizi.GraphicsThreeJS.prototype.enableShadows = function(enable)
{
	this.renderer.shadowMapEnabled = enable;
	this.renderer.shadowMapSoft = enable;
	this.renderer.shadowMapCullFrontFaces = false;
}

Vizi.GraphicsThreeJS.default_display_stats = false;
/**
 *
 */
goog.require('Vizi.Service');
goog.provide('Vizi.TweenService');

/**
 * The TweenService.
 *
 * @extends {Vizi.Service}
 */
Vizi.TweenService = function() {};

goog.inherits(Vizi.TweenService, Vizi.Service);

//---------------------------------------------------------------------
// Initialization/Termination
//---------------------------------------------------------------------

/**
 * Initializes the events system.
 */
Vizi.TweenService.prototype.initialize = function(param) {};

/**
 * Terminates the events world.
 */
Vizi.TweenService.prototype.terminate = function() {};


/**
 * Updates the TweenService.
 */
Vizi.TweenService.prototype.update = function()
{
	if (window.TWEEN)
		TWEEN.update();
}
/**
 * @fileoverview Service locator for various game services.
 */
goog.provide('Vizi.Services');
goog.require('Vizi.Time');
goog.require('Vizi.Input');
goog.require('Vizi.TweenService');
goog.require('Vizi.EventService');
goog.require('Vizi.GraphicsThreeJS');

Vizi.Services = {};

Vizi.Services._serviceMap = 
{ 
		"time" : { object : Vizi.Time },
		"input" : { object : Vizi.Input },
		"tween" : { object : Vizi.TweenService },
		"events" : { object : Vizi.EventService },
		"graphics" : { object : Vizi.GraphicsThreeJS },
};

Vizi.Services.create = function(serviceName)
{
	var serviceType = Vizi.Services._serviceMap[serviceName];
	if (serviceType)
	{
		var prop = serviceType.property;
		
		if (Vizi.Services[serviceName])
		{
	        throw new Error('Cannot create two ' + serviceName + ' service instances');
		}
		else
		{
			if (serviceType.object)
			{
				var service = new serviceType.object;
				Vizi.Services[serviceName] = service;

				return service;
			}
			else
			{
		        throw new Error('No object type supplied for creating service ' + serviceName + '; cannot create');
			}
		}
	}
	else
	{
        throw new Error('Unknown service: ' + serviceName + '; cannot create');
	}
}

Vizi.Services.registerService = function(serviceName, object)
{
	if (Vizi.Services._serviceMap[serviceName])
	{
        throw new Error('Service ' + serviceName + 'already registered; cannot register twice');
	}
	else
	{
		var serviceType = { object: object };
		Vizi.Services._serviceMap[serviceName] = serviceType;
	}
}/**
 * @fileoverview The base Application class
 * 
 * @author Tony Parisi
 */
goog.provide('Vizi.Application');
goog.require('Vizi.EventDispatcher');
goog.require('Vizi.Time');
goog.require('Vizi.Input');
goog.require('Vizi.Services');

/**
 * @constructor
 */
Vizi.Application = function(param)
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	Vizi.EventDispatcher.call(this);
	Vizi.Application.instance = this;
	this.initialize(param);
}

goog.inherits(Vizi.Application, Vizi.EventDispatcher);

Vizi.Application.prototype.initialize = function(param)
{
	param = param || {};

	this.running = false;
	this.tabstop = param.tabstop;
	
	this._services = [];
	this._objects = [];

	// Add required services first
	this.addService("time");
	this.addService("input");
	
	// Add optional (game-defined) services next
	this.addOptionalServices();

	// Add events and rendering services last - got to;
	this.addService("tween");
	this.addService("events");
	this.addService("graphics");
	
	// Start all the services
	this.initServices(param);
}

Vizi.Application.prototype.addService = function(serviceName)
{
	var service = Vizi.Services.create(serviceName);
	this._services.push(service);	
}

Vizi.Application.prototype.initServices = function(param)
{
	var i, len;
	len = this._services.length;
	for (i = 0; i < len; i++)
	{
		this._services[i].initialize(param);
	}
}

Vizi.Application.prototype.addOptionalServices = function()
{
}

Vizi.Application.prototype.focus = function()
{
	// Hack hack hack should be the input system
	Vizi.Graphics.instance.focus();
}

Vizi.Application.prototype.run = function()
{
    // core game loop here
	this.realizeObjects();
	this.lastFrameTime = Date.now();
	this.running = true;
	this.runloop();
}
	        
Vizi.Application.prototype.runloop = function()
{
	var now = Date.now();
	var deltat = now - this.lastFrameTime;
	
	if (deltat >= Vizi.Application.minFrameTime)
	{
		this.updateServices();
        this.lastFrameTime = now;
	}
	
	var that = this;
    requestAnimationFrame( function() { that.runloop(); } );
}

Vizi.Application.prototype.updateServices = function()
{
	var i, len;
	len = this._services.length;
	for (i = 0; i < len; i++)
	{
		this._services[i].update();
	}
}

Vizi.Application.prototype.updateObjects = function()
{
	var i, len = this._objects.length;
	
	for (i = 0; i < len; i++)
	{
		this._objects[i].update();
	}
	
}

Vizi.Application.prototype.addObject = function(o)
{
	this._objects.push(o);
	if (this.running) {
		o.realize();
	}
}

Vizi.Application.prototype.removeObject = function(oe) {
    var i = this._objects.indexOf(o);
    if (i != -1) {
    	// N.B.: I suppose we could be paranoid and check to see if I actually own this component
        this._objects.splice(i, 1);
    }
}

Vizi.Application.prototype.realizeObjects = function()
{
	var i, len = this._objects.length;
	
	for (i = 0; i < len; i++)
	{
		this._objects[i].realize();
	}
	
}
	
Vizi.Application.prototype.onMouseMove = function(event)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseMove(event);
	}
}

Vizi.Application.prototype.onMouseDown = function(event)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseDown(event);
	}
}

Vizi.Application.prototype.onMouseUp = function(event)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseUp(event);
	}
}

Vizi.Application.prototype.onMouseScroll = function(event)
{
	if (this.mouseDelegate)
	{
		this.mouseDelegate.onMouseScroll(event);
	}
}

Vizi.Application.prototype.onKeyDown = function(event)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyDown(event);
	}
}

Vizi.Application.prototype.onKeyUp = function(event)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyUp(event);
	}
}

Vizi.Application.prototype.onKeyPress = function(event)
{
	if (this.keyboardDelegate)
	{
		this.keyboardDelegate.onKeyPress(event);
	}
}	

/* statics */

Vizi.Application.instance = null;
Vizi.Application.curObjectID = 0;
Vizi.Application.minFrameTime = 1;
	    	
Vizi.Application.handleMouseMove = function(event)
{
    if (Vizi.PickManager && Vizi.PickManager.clickedObject)
    	return;
    
    if (Vizi.Application.instance.onMouseMove)
    	Vizi.Application.instance.onMouseMove(event);	            	
}

Vizi.Application.handleMouseDown = function(event)
{
    // Click to focus
    if (Vizi.Application.instance.tabstop)
    	Vizi.Application.instance.focus();
        
    if (Vizi.PickManager && Vizi.PickManager.clickedObject)
    	return;
    
    if (Vizi.Application.instance.onMouseDown)
    	Vizi.Application.instance.onMouseDown(event);	            	
}

Vizi.Application.handleMouseUp = function(event)
{
    if (Vizi.PickManager && Vizi.PickManager.clickedObject)
    	return;
    
    if (Vizi.Application.instance.onMouseUp)
    	Vizi.Application.instance.onMouseUp(event);	            	
}

Vizi.Application.handleMouseScroll = function(event)
{
    if (Vizi.PickManager && Vizi.PickManager.overObject)
    	return;
    
    if (Vizi.Application.instance.onMouseScroll)
    	Vizi.Application.instance.onMouseScroll(event);	            	
}

Vizi.Application.handleKeyDown = function(event)
{
    if (Vizi.Application.instance.onKeyDown)
    	Vizi.Application.instance.onKeyDown(kevent);	            	
}

Vizi.Application.handleKeyUp = function(event)
{
    if (Vizi.Application.instance.onKeyUp)
    	Vizi.Application.instance.onKeyUp(event);	            	
}

Vizi.Application.handleKeyPress = function(event)
{
    if (Vizi.Application.instance.onKeyPress)
    	Vizi.Application.instance.onKeyPress(event);	            	
}	        
/**
 * @fileoverview Behavior component - base class for time-based behaviors
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Script');
goog.require('Vizi.Component');

Vizi.Script = function(param) {
	param = param || {};
    Vizi.Component.call(this, param);
}

goog.inherits(Vizi.Script, Vizi.Component);

Vizi.Script.prototype._componentCategory = "scripts";

Vizi.Script.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
}

Vizi.Script.prototype.update = function()
{
	if (Vizi.Script.WARN_ON_ABSTRACT)
		Vizi.System.warn("Abstract Script.evaluate called");
}

Vizi.Script.WARN_ON_ABSTRACT = true;

goog.require('Vizi.Prefabs');

Vizi.Prefabs.ModelController = function(param)
{
	param = param || {};
	
	var controller = new Vizi.Object(param);
	var controllerScript = new Vizi.ModelControllerScript(param);
	controller.addComponent(controllerScript);

	var timer = new Vizi.Timer( { duration : 3333 } );
	controller.addComponent(timer);

	var viewpoint = new Vizi.Object;
	var camera = new Vizi.PerspectiveCamera({active:param.active, fov: param.fov});
	viewpoint.addComponent(camera);

	controller.addChild(viewpoint);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new Vizi.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
	
	return controller;
}

goog.provide('Vizi.ModelControllerScript');
goog.require('Vizi.Script');

Vizi.ModelControllerScript = function(param)
{
	Vizi.Script.call(this, param);

	this.radius = param.radius || Vizi.ModelControllerScript.default_radius;
	this.minRadius = param.minRadius || Vizi.ModelControllerScript.default_min_radius;
	this.enabled = (param.enabled !== undefined) ? param.enabled : true;
	this._headlightOn = param.headlight;
	
    Object.defineProperties(this, {
        headlightOn: {
	        get: function() {
	            return this._headlightOn;
	        },
	        set:function(v)
	        {
	        	this.setHeadlightOn(v);
	        }
    	},
    });
}

goog.inherits(Vizi.ModelControllerScript, Vizi.Script);

Vizi.ModelControllerScript.prototype.realize = function()
{
	this.headlight = this._object.getComponent(Vizi.DirectionalLight);
	this.headlight.intensity = this._headlightOn ? 1 : 0;
	this.viewpoint = this._object.getChild(0);
	this.camera = this.viewpoint.camera;
		
	this.camera.position.set(0, 0, this.radius);
	
	this.controls = null;
	this.createControls();
	this.controls.enabled = this.enabled;
	this.controls.userMinY = this.minY;
	this.controls.userMinZoom = this.minZoom;
	this.controls.userMaxZoom = this.maxZoom;
}

Vizi.ModelControllerScript.prototype.createControls = function()
{
	this.controls = new Vizi.OrbitControls(this.camera.object, Vizi.Graphics.instance.container);
}

Vizi.ModelControllerScript.prototype.update = function()
{
	this.controls.update();
	if (this._headlightOn)
	{
		this.headlight.direction.copy(this.camera.position).negate();
	}	
}

Vizi.ModelControllerScript.prototype.setHeadlightOn = function(on)
{
	this._headlightOn = on;
	if (this.headlight) {
		this.headlight.intensity = on ? 1 : 0;
	}
}

Vizi.ModelControllerScript.default_radius = 5;
Vizi.ModelControllerScript.default_min_radius = 1;
Vizi.ModelControllerScript.MAX_X_ROTATION = 0; // Math.PI / 12;
Vizi.ModelControllerScript.MIN_X_ROTATION = -Math.PI / 2;
Vizi.ModelControllerScript.MAX_Y_ROTATION = Math.PI * 2;
Vizi.ModelControllerScript.MIN_Y_ROTATION = -Math.PI * 2;
goog.provide('Vizi.SpotLight');
goog.require('Vizi.Light');

Vizi.SpotLight = function(param)
{
	param = param || {};

	this.scaledDir = new THREE.Vector3;
	this.castShadows = ( param.castShadows !== undefined ) ? param.castShadows : Vizi.SpotLight.DEFAULT_CAST_SHADOWS;
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
		this.direction = param.object.position.clone().normalize().negate();
		this.targetPos = param.object.target.clone();
		this.shadowDarkness = param.object.shadowDarkness;
	}
	else {
		this.direction = param.direction || new THREE.Vector3(0, 0, -1);
		this.targetPos = new THREE.Vector3;
		this.shadowDarkness = ( param.shadowDarkness !== undefined ) ? param.shadowDarkness : Vizi.SpotLight.DEFAULT_SHADOW_DARKNESS;

		var angle = ( param.angle !== undefined ) ? param.angle : Vizi.SpotLight.DEFAULT_ANGLE;
		var distance = ( param.distance !== undefined ) ? param.distance : Vizi.SpotLight.DEFAULT_DISTANCE;
		var exponent = ( param.exponent !== undefined ) ? param.exponent : Vizi.SpotLight.DEFAULT_EXPONENT;

		this.object = new THREE.SpotLight(param.color, param.intensity, distance, angle, exponent);
	}
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        angle: {
	        get: function() {
	            return this.object.angle;
	        },
	        set: function(v) {
	        	this.object.angle = v;
	        }
		},    	
        distance: {
	        get: function() {
	            return this.object.distance;
	        },
	        set: function(v) {
	        	this.object.distance = v;
	        }
    	},    	
        exponent: {
	        get: function() {
	            return this.object.exponent;
	        },
	        set: function(v) {
	        	this.object.exponent = v;
	        }
    	},    	

    });
	
}

goog.inherits(Vizi.SpotLight, Vizi.Light);

Vizi.SpotLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.SpotLight.prototype.update = function() 
{
	// D'oh Three.js doesn't seem to transform light directions automatically
	// Really bizarre semantics
	if (this.object)
	{
		this.scaledDir.copy(this.direction);
		this.scaledDir.multiplyScalar(Vizi.Light.DEFAULT_RANGE);
		this.targetPos.copy(this.position);
		this.targetPos.add(this.scaledDir);	
		this.object.target.position.copy(this.targetPos);
		
		var worldmat = this.object.parent.matrixWorld;
		this.position.applyMatrix4(worldmat);
		this.object.target.position.applyMatrix4(worldmat);
		
		this.updateShadows();
	}
	
	// Update the rest
	Vizi.Light.prototype.update.call(this);
}

Vizi.SpotLight.prototype.updateShadows = function()
{
	if (this.castShadows)
	{
		this.object.castShadow = true;
		this.object.shadowCameraNear = 1;
		this.object.shadowCameraFar = Vizi.Light.DEFAULT_RANGE;
		this.object.shadowCameraFov = 90;

		// light.shadowCameraVisible = true;

		this.object.shadowBias = 0.0001;
		this.object.shadowDarkness = this.shadowDarkness;

		this.object.shadowMapWidth = 2048;
		this.object.shadowMapHeight = 2048;
		
		Vizi.Graphics.instance.enableShadows(true);
	}	
}

Vizi.SpotLight.DEFAULT_DISTANCE = 0;
Vizi.SpotLight.DEFAULT_ANGLE = Math.PI / 2;
Vizi.SpotLight.DEFAULT_EXPONENT = 10;
Vizi.SpotLight.DEFAULT_CAST_SHADOWS = false;
Vizi.SpotLight.DEFAULT_SHADOW_DARKNESS = 0.3;
goog.provide('Vizi.Camera');
goog.require('Vizi.SceneComponent');

Vizi.Camera = function(param)
{
	param = param || {};
	
	Vizi.SceneComponent.call(this, param);

    // Accessors
    Object.defineProperties(this, {
        active: {
	        get: function() {
	            return this._active;
	        },
	        set: function(v) {
	        	this._active = v;
	        	if (this._realized && this._active)
	        	{
	        		Vizi.CameraManager.setActiveCamera(this);
	        	}
	        }
    	},    	

    });
	
	this._active = param.active || false;
	var position = param.position || Vizi.Camera.DEFAULT_POSITION;
    this.position.copy(position);	
}

goog.inherits(Vizi.Camera, Vizi.SceneComponent);

Vizi.Camera.prototype._componentProperty = "camera";
Vizi.Camera.prototype._componentPropertyType = "Camera";

Vizi.Camera.prototype.realize = function() 
{
	Vizi.SceneComponent.prototype.realize.call(this);
	
	this.addToScene();
	
	Vizi.CameraManager.addCamera(this);
	
	if (this._active)
	{
		Vizi.CameraManager.setActiveCamera(this);
	}
}

Vizi.Camera.prototype.lookAt = function(v) 
{
	this.object.lookAt(v);
}

Vizi.Camera.DEFAULT_POSITION = new THREE.Vector3(0, 0, 10);
Vizi.Camera.DEFAULT_NEAR = 1;
Vizi.Camera.DEFAULT_FAR = 4000;
goog.provide('Vizi.PerspectiveCamera');
goog.require('Vizi.Camera');

Vizi.PerspectiveCamera = function(param) {
	param = param || {};
	
	if (param.object) {
		this.object = param.object;
	}
	else {		
		var fov = param.fov || 45;
		var near = param.near || Vizi.Camera.DEFAULT_NEAR;
		var far = param.far || Vizi.Camera.DEFAULT_FAR;
		var container = Vizi.Graphics.instance.container;
		var aspect = param.aspect || (container.offsetWidth / container.offsetHeight);
		this.updateProjection = false;
		
		this.object = new THREE.PerspectiveCamera( fov, aspect, near, far );
	}
	
    // Create accessors for all properties... just pass-throughs to Three.js
    Object.defineProperties(this, {
        fov: {
	        get: function() {
	            return this.object.fov;
	        },
	        set: function(v) {
	        	this.object.fov = v;
	        	this.updateProjection = true;
	        }
		},    	
        aspect: {
	        get: function() {
	            return this.object.aspect;
	        },
	        set: function(v) {
	        	this.object.aspect = v;
	        	this.updateProjection = true;
	        }
    	},    	
        near: {
	        get: function() {
	            return this.object.near;
	        },
	        set: function(v) {
	        	this.object.near = v;
	        	this.updateProjection = true;
	        }
    	},    	
        far: {
	        get: function() {
	            return this.object.far;
	        },
	        set: function(v) {
	        	this.object.far = v;
	        	this.updateProjection = true;
	        }
    	},    	

    });

	Vizi.Camera.call(this, param);
	
    
}

goog.inherits(Vizi.PerspectiveCamera, Vizi.Camera);

Vizi.PerspectiveCamera.prototype.realize = function()  {
	Vizi.Camera.prototype.realize.call(this);	
}

Vizi.PerspectiveCamera.prototype.update = function()  {
	if (this.updateProjection)
	{
		this.object.updateProjectionMatrix();
		this.updateProjection = false;
	}
}
/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Picker');
goog.require('Vizi.Component');

Vizi.Picker = function(param) {
	param = param || {};
	
    Vizi.Component.call(this, param);
    this.overCursor = param.overCursor;
}

goog.inherits(Vizi.Picker, Vizi.Component);

Vizi.Picker.prototype._componentProperty = "picker";
Vizi.Picker.prototype._componentPropertyType = "Picker";

Vizi.Picker.prototype.realize = function()
{
	Vizi.Component.prototype.realize.call(this);
	
    this.lastHitPoint = new THREE.Vector3;
    this.lastHitNormal = new THREE.Vector3;
}

Vizi.Picker.prototype.update = function()
{
}

Vizi.Picker.prototype.onMouseOver = function(event)
{
    this.dispatchEvent("mouseover", event);
}

Vizi.Picker.prototype.onMouseOut = function(event)
{
    this.dispatchEvent("mouseout", event);
}
	        	        
Vizi.Picker.prototype.onMouseMove = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject == this)
	{
		this.lastHitPoint.copy(event.point);
		this.lastHitNormal.copy(event.normal);
		this.dispatchEvent("mousemove", event);
	}
}

Vizi.Picker.prototype.onMouseDown = function(event)
{
	this.lastHitPoint.copy(event.point);
	this.lastHitNormal.copy(event.normal);
    this.dispatchEvent("mousedown", event);
}

Vizi.Picker.prototype.onMouseUp = function(event)
{
	var mouseOverObject = Vizi.PickManager.objectFromMouse(event);
	if (mouseOverObject != this)
	{
		event.point = this.lastHitPoint;
		event.normal = this.lastHitNormal;
		this.dispatchEvent("mouseout", event);
	}

	this.dispatchEvent("mouseup", event);
}
	        
Vizi.Picker.prototype.onMouseScroll = function(event)
{
    this.dispatchEvent("mousescroll", event);
}

goog.provide("Vizi.System");

Vizi.System = {
	log : function() {
		var args = [].slice.call(arguments);
		console.log.apply(console, args);
	},
	warn : function() {
		var args = ["Vizi Warning: "].concat([].slice.call(arguments));
		console.warn.apply(console, args);
	}
};/**
 * @fileoverview HighlightBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.HighlightBehavior');
goog.require('Vizi.Behavior');

Vizi.HighlightBehavior = function(param) {
	param = param || {};
	this.highlightColor = (param.highlightColor !== undefined) ? param.highlightColor : 0xffffff;
	this.savedColor = 0;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.HighlightBehavior, Vizi.Behavior);

Vizi.HighlightBehavior.prototype.start = function()
{
	Vizi.Behavior.prototype.start.call(this);
	
	if (this._realized && this._object.visual)
	{
		this.savedColor = this._object.visual.material.color.getHex();
		this._object.visual.material.color.setHex(this.highlightColor);
	}
}

Vizi.HighlightBehavior.prototype.evaluate = function(t)
{
}

Vizi.HighlightBehavior.prototype.stop = function()
{
	Vizi.Behavior.prototype.stop.call(this);

	if (this._realized && this._object.visual)
	{
		this._object.visual.material.color.setHex(this.savedColor);
	}

}

// Alias a few functions - syntactic sugar
Vizi.HighlightBehavior.prototype.on = Vizi.HighlightBehavior.prototype.start;
Vizi.HighlightBehavior.prototype.off = Vizi.HighlightBehavior.prototype.stop;
/**
 * @fileoverview BounceBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.BounceBehavior');
goog.require('Vizi.Behavior');

Vizi.BounceBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.bounceVector = (param.bounceVector !== undefined) ? param.bounceVector : new THREE.Vector3(0, 1, 0);
	this.tweenUp = null;
	this.tweenDown = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.BounceBehavior, Vizi.Behavior);

Vizi.BounceBehavior.prototype.start = function()
{
	if (this.running)
		return;
	
	this.bouncePosition = new THREE.Vector3;
	this.bounceEndPosition = this.bounceVector.clone();
	this.prevBouncePosition = new THREE.Vector3;
	this.bounceDelta = new THREE.Vector3;
	this.tweenUp = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.duration / 2 * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.BounceBehavior.prototype.evaluate = function(t)
{
	this.bounceDelta.copy(this.bouncePosition).sub(this.prevBouncePosition);
	this.prevBouncePosition.copy(this.bouncePosition);
	
	this._object.transform.position.add(this.bounceDelta);
	
	if (t >= (this.duration / 2))
	{
		if (this.tweenUp)
		{
			this.tweenUp.stop();
			this.tweenUp = null;
		}

		if (!this.tweenDown)
		{
			this.bouncePosition = this._object.transform.position.clone();
			this.bounceEndPosition = this.bouncePosition.clone().sub(this.bounceVector);
			this.prevBouncePosition = this.bouncePosition.clone();
			this.bounceDelta = new THREE.Vector3;
			this.tweenDown = new TWEEN.Tween(this.bouncePosition).to(this.bounceEndPosition, this.duration / 2 * 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.repeat(0)
			.start();
		}
	}
	
	if (t >= this.duration)
	{
		this.tweenDown.stop();
		this.tweenDown = null;
		this.stop();
		
		if (this.loop)
			this.start();
	}
}/**
 * @fileoverview Camera Manager - singleton to manage cameras, active, resize etc.
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.CameraManager');

Vizi.CameraManager.addCamera = function(camera)
{
	Vizi.CameraManager.cameraList.push(camera);
}

Vizi.CameraManager.removeCamera = function(camera)
{
    var i = Vizi.CameraManager.cameraList.indexOf(camera);

    if (i != -1)
    {
    	Vizi.CameraManager.cameraList.splice(i, 1);
    }
}

Vizi.CameraManager.setActiveCamera = function(camera)
{
	if (Vizi.CameraManager.activeCamera)
		Vizi.CameraManager.activeCamera.active = false;
	
	Vizi.CameraManager.activeCamera = camera;
	Vizi.Graphics.instance.camera = camera.object;
}


Vizi.CameraManager.handleWindowResize = function(width, height)
{
	var cameras = Vizi.CameraManager.cameraList;
	
	if (cameras.length == 0)
		return false;

	var i, len = cameras.length;
	for (i = 0; i < len; i++)
	{
		var camera = cameras[i];
		camera.aspect = width / height;
	}

	return true;
}


Vizi.CameraManager.cameraList = [];
Vizi.CameraManager.activeCamera = null;goog.provide('Vizi.DirectionalLight');
goog.require('Vizi.Light');

Vizi.DirectionalLight = function(param)
{
	param = param || {};
	
	Vizi.Light.call(this, param);

	if (param.object) {
		this.object = param.object; 
		this.direction = param.object.position.clone().normalize().negate();
	}
	else {
		this.direction = param.direction || new THREE.Vector3(0, 0, -1);
		this.object = new THREE.DirectionalLight(param.color, param.intensity, 0);
	}
}

goog.inherits(Vizi.DirectionalLight, Vizi.Light);

Vizi.DirectionalLight.prototype.realize = function() 
{
	Vizi.Light.prototype.realize.call(this);
}

Vizi.DirectionalLight.prototype.update = function() 
{
	// D'oh Three.js doesn't seem to transform light directions automatically
	// Really bizarre semantics
	this.position.copy(this.direction).negate();
	this.object.target.position.copy(this.direction).multiplyScalar(Vizi.Light.DEFAULT_RANGE);
	var worldmat = this.object.parent.matrixWorld;
	this.position.applyMatrix4(worldmat);
	this.object.target.position.applyMatrix4(worldmat);
	
	Vizi.Light.prototype.update.call(this);
}

/**
 * @fileoverview Picker component - add one to get picking support on your object
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.PlaneDragger');
goog.require('Vizi.Picker');

Vizi.PlaneDragger = function(param) {
    Vizi.Picker.call(this, param);
}

goog.inherits(Vizi.PlaneDragger, Vizi.Picker);

Vizi.PlaneDragger.prototype.realize = function()
{
	Vizi.Picker.prototype.realize.call(this);

	// Create a projector object
    this.projector = new THREE.Projector();
	
    // And some helpers
    this.dragObject = null;
	this.dragOffset = new THREE.Vector3;
	this.dragHitPoint = new THREE.Vector3;
	this.dragStartPoint = new THREE.Vector3;
	this.dragPlane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
	this.dragPlane.visible = false;
	this._object.transform.object.add(this.dragPlane);
}

Vizi.PlaneDragger.prototype.update = function()
{
}

Vizi.PlaneDragger.prototype.onMouseMove = function(event)
{
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragHitPoint.copy(intersection.point).sub(this.dragOffset);
		this.dragHitPoint.add(this.dragStartPoint);
		this.dispatchEvent("drag", {
									type : "drag", 
									object : this.dragObject, 
									offset : this.dragHitPoint
									}
		);
	}
}

Vizi.PlaneDragger.prototype.onMouseDown = function(event)
{
	Vizi.Picker.prototype.onMouseDown.call(this, event);
	
	var intersection = Vizi.Graphics.instance.getObjectIntersection(event.elementX, event.elementY, this.dragPlane);
	
	if (intersection)
	{
		this.dragOffset.copy(intersection.point); // .sub(this.dragPlane.position);
		this.dragStartPoint.set(0, 0, 0);
		this.dragStartPoint.applyMatrix4(event.object.object.matrixWorld);
		this.dragObject = event.object;
	}
}


/**
 * @fileoverview Loader - loads level files
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Loader');
goog.require('Vizi.EventDispatcher');

/**
 * @constructor
 * @extends {Vizi.PubSub}
 */
Vizi.Loader = function()
{
    Vizi.EventDispatcher.call(this);	
}

goog.inherits(Vizi.Loader, Vizi.EventDispatcher);
        
Vizi.Loader.prototype.loadModel = function(url)
{
	var spliturl = url.split('.');
	var len = spliturl.length;
	var ext = '';
	if (len)
	{
		ext = spliturl[len - 1];
	}
	
	if (ext && ext.length)
	{
	}
	else
	{
		return;
	}
	
	var loaderClass;
	
	switch (ext.toUpperCase())
	{
		case 'JS' :
			loaderClass = THREE.JSONLoader;
			break;
		default :
			break;
	}
	
	if (loaderClass)
	{
		var loader = new loaderClass;
		var that = this;
		
		loader.load(url, function (data) {
			that.handleModelLoaded(url, data);
		});		
	}
}

Vizi.Loader.prototype.handleModelLoaded = function(url, data)
{
	if (data.scene)
	{
		var material = new THREE.MeshFaceMaterial();
		var mesh = new Vizi.Visual({geometry:data, material:material});
		this.dispatchEvent("loaded", mesh);
	}
}

Vizi.Loader.prototype.loadScene = function(url)
{
	var spliturl = url.split('.');
	var len = spliturl.length;
	var ext = '';
	if (len)
	{
		ext = spliturl[len - 1];
	}
	
	if (ext && ext.length)
	{
	}
	else
	{
		return;
	}
	
	var loaderClass;
	
	switch (ext.toUpperCase())
	{
		case 'DAE' :
			loaderClass = THREE.ColladaLoader;
			break;
		case 'JS' :
			loaderClass = THREE.SceneLoader;
			break;
		default :
			break;
	}
	
	if (loaderClass)
	{
		var loader = new loaderClass;
		var that = this;
		
		loader.load(url, 
				function (data) {
					that.handleSceneLoaded(url, data);
				},
				function (data) {
					that.handleSceneProgress(url, data);
				}
		);		
	}
}

Vizi.Loader.prototype.traverseCallback = function(n, result)
{
	// Look for cameras
	if (n instanceof THREE.Camera)
	{
		if (!result.cameras)
			result.cameras = [];
		
		result.cameras.push(n);
	}

	// Look for lights
	if (n instanceof THREE.Light)
	{
		if (!result.lights)
			result.lights = [];
		
		result.lights.push(n);
	}
}

Vizi.Loader.prototype.handleSceneLoaded = function(url, data)
{
	var result = {};
	var success = false;
	
	if (data.scene)
	{
		var convertedScene = this.convertScene(data.scene);
		
		result.scene = convertedScene; // new Vizi.SceneVisual({scene:data.scene});
		var that = this;
		data.scene.traverse(function (n) { that.traverseCallback(n, result); });
		success = true;
	}
	
	if (data.animations)
	{
		result.keyFrameAnimators = [];
		var i, len = data.animations.length;
		for (i = 0; i < len; i++)
		{
			var animations = [];
			animations.push(data.animations[i]);
			result.keyFrameAnimators.push(new Vizi.KeyFrameAnimator({animations:animations}));
		}
	}
	
	/*
	if (data.skins && data.skins.length)
	{
		// result.meshAnimator = new Vizi.MeshAnimator({skins:data.skins});
	}
	*/
	
	if (success)
		this.dispatchEvent("loaded", result);
}

Vizi.Loader.prototype.handleSceneProgress = function(url, progress)
{
	this.dispatchEvent("progress", progress);
}

Vizi.Loader.prototype.convertScene = function(scene) {

	function convert(n) {
		var o = new Vizi.Object({autoCreateTransform:false});
		o.addComponent(new Vizi.Transform({object:n}));
		o.name = n.name;
		if (n instanceof THREE.Mesh) {
			o.addComponent(new Vizi.Visual({object:n}));
		}
		else if (n instanceof THREE.Camera) {
			if (n instanceof THREE.PerspectiveCamera) {
				o.addComponent(new Vizi.PerspectiveCamera({object:n}));
			}
		}
		else if (n instanceof THREE.Light) {
			if (n instanceof THREE.AmbientLight) {
				o.addComponent(new Vizi.AmbientLight({object:n}));
			}
			else if (n instanceof THREE.DirectionalLight) {
				o.addComponent(new Vizi.DirectionalLight({object:n}));
			}
			else if (n instanceof THREE.PointLight) {
				o.addComponent(new Vizi.PointLight({object:n}));
			}
			else if (n instanceof THREE.SpotLight) {
				o.addComponent(new Vizi.SpotLight({object:n}));
			}
		}
		else if (n.children) {
			var i, len = n.children.length;
			for (i = 0; i < len; i++) {
				var childNode  = n.children[i];
				var child = convert(childNode);
				if (child) {
					o.addChild(child);
				}
				else {
					// N.B.: what???
				}
			}
		}
		
		return o;
	}

	return convert(scene);
}
/**
 * @fileoverview Module Configuration
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.Modules');
goog.require('Vizi.Component');
goog.require('Vizi.Object');
goog.require('Vizi.Application');
goog.require('Vizi.Service');
goog.require('Vizi.Services');
goog.require('Vizi.TweenService');
goog.require('Vizi.Behavior');
goog.require('Vizi.BounceBehavior');
goog.require('Vizi.HighlightBehavior');
goog.require('Vizi.MoveBehavior');
goog.require('Vizi.RotateBehavior');
goog.require('Vizi.Camera');
goog.require('Vizi.CameraManager');
goog.require('Vizi.PerspectiveCamera');
goog.require('Vizi.OrbitControls');
goog.require('Vizi.ModelControllerScript');
goog.require('Vizi.EventDispatcher');
goog.require('Vizi.EventService');
goog.require('Vizi.Graphics');
goog.require('Vizi.Input');
goog.require('Vizi.Keyboard');
goog.require('Vizi.Mouse');
goog.require('Vizi.Picker');
goog.require('Vizi.PickManager');
goog.require('Vizi.PlaneDragger');
goog.require('Vizi.Light');
goog.require('Vizi.AmbientLight');
goog.require('Vizi.DirectionalLight');
goog.require('Vizi.PointLight');
goog.require('Vizi.SpotLight');
goog.require('Vizi.Loader');
goog.require('Vizi.Prefabs');
goog.require('Vizi.SceneComponent');
goog.require('Vizi.Transform');
goog.require('Vizi.Script');
goog.require('Vizi.System');
goog.require('Vizi.Time');
goog.require('Vizi.Timer');
goog.require('Vizi.Visual');
goog.require('Vizi.SceneVisual');

/**
 * @constructor
 */
Vizi.Modules = function()
{
}

var CLOSURE_NO_DEPS = true;

