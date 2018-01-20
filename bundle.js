(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = ((fs.accessSync && function (path) { try { fs.accessSync(path); } catch (e) { return false; } return true; })
      || fs.existsSync || path.existsSync)
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function(i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,"/Users\\Jacob\\OneDrive\\Documents\\Sublime Projects\\jsdominos\\node_modules\\bindings\\bindings.js")
},{"fs":undefined,"path":undefined}],2:[function(require,module,exports){
/*!
 * bufferutil: WebSocket buffer utils
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
const mask = (source, mask, output, offset, length) => {
  for (var i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
};

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
const unmask = (buffer, mask) => {
  // Required until https://github.com/nodejs/node/issues/9006 is resolved.
  const length = buffer.length;
  for (var i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
};

module.exports = { mask, unmask };

},{}],3:[function(require,module,exports){
'use strict';

try {
  module.exports = require('bindings')('bufferutil');
} catch (e) {
  module.exports = require('./fallback');
}

},{"./fallback":2,"bindings":1}],4:[function(require,module,exports){
/*!
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');

function Options(defaults) {
  var internalValues = {};
  var values = this.value = {};
  Object.keys(defaults).forEach(function(key) {
    internalValues[key] = defaults[key];
    Object.defineProperty(values, key, {
      get: function() { return internalValues[key]; },
      configurable: false,
      enumerable: true
    });
  });
  this.reset = function() {
    Object.keys(defaults).forEach(function(key) {
      internalValues[key] = defaults[key];
    });
    return this;
  };
  this.merge = function(options, required) {
    options = options || {};
    if (Object.prototype.toString.call(required) === '[object Array]') {
      var missing = [];
      for (var i = 0, l = required.length; i < l; ++i) {
        var key = required[i];
        if (!(key in options)) {
          missing.push(key);
        }
      }
      if (missing.length > 0) {
        if (missing.length > 1) {
          throw new Error('options ' +
            missing.slice(0, missing.length - 1).join(', ') + ' and ' +
            missing[missing.length - 1] + ' must be defined');
        }
        else throw new Error('option ' + missing[0] + ' must be defined');
      }
    }
    Object.keys(options).forEach(function(key) {
      if (key in internalValues) {
        internalValues[key] = options[key];
      }
    });
    return this;
  };
  this.copy = function(keys) {
    var obj = {};
    Object.keys(defaults).forEach(function(key) {
      if (keys.indexOf(key) !== -1) {
        obj[key] = values[key];
      }
    });
    return obj;
  };
  this.read = function(filename, cb) {
    if (typeof cb == 'function') {
      var self = this;
      fs.readFile(filename, function(error, data) {
        if (error) return cb(error);
        var conf = JSON.parse(data);
        self.merge(conf);
        cb();
      });
    }
    else {
      var conf = JSON.parse(fs.readFileSync(filename));
      this.merge(conf);
    }
    return this;
  };
  this.isDefined = function(key) {
    return typeof values[key] != 'undefined';
  };
  this.isDefinedAndNonNull = function(key) {
    return typeof values[key] != 'undefined' && values[key] !== null;
  };
  Object.freeze(values);
  Object.freeze(this);
}

module.exports = Options;

},{"fs":undefined}],5:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments
    , event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    args = [];

    for (event in this.ee._events) {
      if (has.call(this.ee._events, event)) args.push(event);
    }
  }

  for (var i = 0; i < args.length; i++) {
    var listeners = this.ee.listeners(args[i]);

    for (var j = 0; j < listeners.length; j++) {
      event = listeners[j];

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
        delete event.listener.__ultron;
      } else {
        if (event.__ultron !== this.id) continue;
        delete event.__ultron;
      }

      this.ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
module.exports = Ultron;

},{}],6:[function(require,module,exports){
/*!
 * UTF-8 validate: UTF-8 validation for WebSockets.
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
const isValidUTF8 = (buf) => {
  var len = buf.length;
  var i = 0;

  while (i < len) {
    if (buf[i] < 0x80) {  // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {  // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0  // overlong
      ) {
        return false;
      } else {
        i += 2;
      }
    } else if ((buf[i] & 0xf0) === 0xe0) {  // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||  // overlong
        buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0     // surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      } else {
        i += 3;
      }
    } else if ((buf[i] & 0xf8) === 0xf0) {  // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||  // overlong
        buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4  // > U+10FFFF
      ) {
        return false;
      } else {
        i += 4;
      }
    } else {
      return false;
    }
  }

  return true;
};

module.exports = isValidUTF8;

},{}],7:[function(require,module,exports){
'use strict';

try {
  module.exports = require('bindings')('validation');
} catch (e) {
  module.exports = require('./fallback');
}

},{"./fallback":6,"bindings":1}],8:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var WS = module.exports = require('./lib/WebSocket');

WS.Server = require('./lib/WebSocketServer');
WS.Sender = require('./lib/Sender');
WS.Receiver = require('./lib/Receiver');

/**
 * Create a new WebSocket server.
 *
 * @param {Object} options Server options
 * @param {Function} fn Optional connection listener.
 * @returns {WS.Server}
 * @api public
 */
WS.createServer = function createServer(options, fn) {
  var server = new WS.Server(options);

  if (typeof fn === 'function') {
    server.on('connection', fn);
  }

  return server;
};

/**
 * Create a new WebSocket connection.
 *
 * @param {String} address The URL/address we need to connect to.
 * @param {Function} fn Open listener.
 * @returns {WS}
 * @api public
 */
WS.connect = WS.createConnection = function connect(address, fn) {
  var client = new WS(address);

  if (typeof fn === 'function') {
    client.on('open', fn);
  }

  return client;
};

},{"./lib/Receiver":16,"./lib/Sender":18,"./lib/WebSocket":21,"./lib/WebSocketServer":22}],9:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util');

function BufferPool(initialSize, growStrategy, shrinkStrategy) {
  if (this instanceof BufferPool === false) {
    throw new TypeError("Classes can't be function-called");
  }

  if (typeof initialSize === 'function') {
    shrinkStrategy = growStrategy;
    growStrategy = initialSize;
    initialSize = 0;
  }
  else if (typeof initialSize === 'undefined') {
    initialSize = 0;
  }
  this._growStrategy = (growStrategy || function(db, size) {
    return db.used + size;
  }).bind(null, this);
  this._shrinkStrategy = (shrinkStrategy || function(db) {
    return initialSize;
  }).bind(null, this);
  this._buffer = initialSize ? new Buffer(initialSize) : null;
  this._offset = 0;
  this._used = 0;
  this._changeFactor = 0;
  this.__defineGetter__('size', function(){
    return this._buffer == null ? 0 : this._buffer.length;
  });
  this.__defineGetter__('used', function(){
    return this._used;
  });
}

BufferPool.prototype.get = function(length) {
  if (this._buffer == null || this._offset + length > this._buffer.length) {
    var newBuf = new Buffer(this._growStrategy(length));
    this._buffer = newBuf;
    this._offset = 0;
  }
  this._used += length;
  var buf = this._buffer.slice(this._offset, this._offset + length);
  this._offset += length;
  return buf;
}

BufferPool.prototype.reset = function(forceNewBuffer) {
  var len = this._shrinkStrategy();
  if (len < this.size) this._changeFactor -= 1;
  if (forceNewBuffer || this._changeFactor < -2) {
    this._changeFactor = 0;
    this._buffer = len ? new Buffer(len) : null;
  }
  this._offset = 0;
  this._used = 0;
}

module.exports = BufferPool;

},{"util":undefined}],10:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

exports.BufferUtil = {
  merge: function(mergedBuffer, buffers) {
    var offset = 0;
    for (var i = 0, l = buffers.length; i < l; ++i) {
      var buf = buffers[i];
      buf.copy(mergedBuffer, offset);
      offset += buf.length;
    }
  },
  mask: function(source, mask, output, offset, length) {
    var maskNum = mask.readUInt32LE(0, true);
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ source.readUInt32LE(i, true);
      if (num < 0) num = 4294967296 + num;
      output.writeUInt32LE(num, offset + i, true);
    }
    switch (length % 4) {
      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
      case 1: output[offset + i] = source[i] ^ mask[0];
      case 0:;
    }
  },
  unmask: function(data, mask) {
    var maskNum = mask.readUInt32LE(0, true);
    var length = data.length;
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ data.readUInt32LE(i, true);
      if (num < 0) num = 4294967296 + num;
      data.writeUInt32LE(num, i, true);
    }
    switch (length % 4) {
      case 3: data[i + 2] = data[i + 2] ^ mask[2];
      case 2: data[i + 1] = data[i + 1] ^ mask[1];
      case 1: data[i] = data[i] ^ mask[0];
      case 0:;
    }
  }
}

},{}],11:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var bufferUtil;

try {
  bufferUtil = require('bufferutil');
} catch (e) {
  bufferUtil = require('./BufferUtil.fallback');
}

module.exports = bufferUtil.BufferUtil || bufferUtil;

},{"./BufferUtil.fallback":10,"bufferutil":3}],12:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

module.exports = {
  isValidErrorCode: function(code) {
    return (code >= 1000 && code <= 1011 && code != 1004 && code != 1005 && code != 1006) ||
         (code >= 3000 && code <= 4999);
  },
  1000: 'normal',
  1001: 'going away',
  1002: 'protocol error',
  1003: 'unsupported data',
  1004: 'reserved',
  1005: 'reserved for extensions',
  1006: 'reserved for extensions',
  1007: 'inconsistent or invalid data',
  1008: 'policy violation',
  1009: 'message too big',
  1010: 'extension handshake missing',
  1011: 'an unexpected condition prevented the request from being fulfilled',
};
},{}],13:[function(require,module,exports){

var util = require('util');

/**
 * Module exports.
 */

exports.parse = parse;
exports.format = format;

/**
 * Parse extensions header value
 */

function parse(value) {
  value = value || '';

  var extensions = {};

  value.split(',').forEach(function(v) {
    var params = v.split(';');
    var token = params.shift().trim();

    if (extensions[token] === undefined) {
      extensions[token] = [];
    } else if (!extensions.hasOwnProperty(token)) {
      return;
    }

    var parsedParams = {};

    params.forEach(function(param) {
      var parts = param.trim().split('=');
      var key = parts[0];
      var value = parts[1];
      if (typeof value === 'undefined') {
        value = true;
      } else {
        // unquote value
        if (value[0] === '"') {
          value = value.slice(1);
        }
        if (value[value.length - 1] === '"') {
          value = value.slice(0, value.length - 1);
        }
      }

      if (parsedParams[key] === undefined) {
        parsedParams[key] = [value];
      } else if (parsedParams.hasOwnProperty(key)) {
        parsedParams[key].push(value);
      }
    });

    extensions[token].push(parsedParams);
  });

  return extensions;
}

/**
 * Format extensions header value
 */

function format(value) {
  return Object.keys(value).map(function(token) {
    var paramsList = value[token];
    if (!util.isArray(paramsList)) {
      paramsList = [paramsList];
    }
    return paramsList.map(function(params) {
      return [token].concat(Object.keys(params).map(function(k) {
        var p = params[k];
        if (!util.isArray(p)) p = [p];
        return p.map(function(v) {
          return v === true ? k : k + '=' + v;
        }).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

},{"util":undefined}],14:[function(require,module,exports){

var zlib = require('zlib');

var AVAILABLE_WINDOW_BITS = [8, 9, 10, 11, 12, 13, 14, 15];
var DEFAULT_WINDOW_BITS = 15;
var DEFAULT_MEM_LEVEL = 8;

PerMessageDeflate.extensionName = 'permessage-deflate';

/**
 * Per-message Compression Extensions implementation
 */

function PerMessageDeflate(options, isServer,maxPayload) {
  if (this instanceof PerMessageDeflate === false) {
    throw new TypeError("Classes can't be function-called");
  }

  this._options = options || {};
  this._isServer = !!isServer;
  this._inflate = null;
  this._deflate = null;
  this.params = null;
  this._maxPayload = maxPayload || 0;
}

/**
 * Create extension parameters offer
 *
 * @api public
 */

PerMessageDeflate.prototype.offer = function() {
  var params = {};
  if (this._options.serverNoContextTakeover) {
    params.server_no_context_takeover = true;
  }
  if (this._options.clientNoContextTakeover) {
    params.client_no_context_takeover = true;
  }
  if (this._options.serverMaxWindowBits) {
    params.server_max_window_bits = this._options.serverMaxWindowBits;
  }
  if (this._options.clientMaxWindowBits) {
    params.client_max_window_bits = this._options.clientMaxWindowBits;
  } else if (this._options.clientMaxWindowBits == null) {
    params.client_max_window_bits = true;
  }
  return params;
};

/**
 * Accept extension offer
 *
 * @api public
 */

PerMessageDeflate.prototype.accept = function(paramsList) {
  paramsList = this.normalizeParams(paramsList);

  var params;
  if (this._isServer) {
    params = this.acceptAsServer(paramsList);
  } else {
    params = this.acceptAsClient(paramsList);
  }

  this.params = params;
  return params;
};

/**
 * Releases all resources used by the extension
 *
 * @api public
 */

PerMessageDeflate.prototype.cleanup = function() {
  if (this._inflate) {
    if (this._inflate.writeInProgress) {
      this._inflate.pendingClose = true;
    } else {
      if (this._inflate.close) this._inflate.close();
      this._inflate = null;
    }
  }
  if (this._deflate) {
    if (this._deflate.writeInProgress) {
      this._deflate.pendingClose = true;
    } else {
      if (this._deflate.close) this._deflate.close();
      this._deflate = null;
    }
  }
};

/**
 * Accept extension offer from client
 *
 * @api private
 */

PerMessageDeflate.prototype.acceptAsServer = function(paramsList) {
  var accepted = {};
  var result = paramsList.some(function(params) {
    accepted = {};
    if (this._options.serverNoContextTakeover === false && params.server_no_context_takeover) {
      return;
    }
    if (this._options.serverMaxWindowBits === false && params.server_max_window_bits) {
      return;
    }
    if (typeof this._options.serverMaxWindowBits === 'number' &&
        typeof params.server_max_window_bits === 'number' &&
        this._options.serverMaxWindowBits > params.server_max_window_bits) {
      return;
    }
    if (typeof this._options.clientMaxWindowBits === 'number' && !params.client_max_window_bits) {
      return;
    }

    if (this._options.serverNoContextTakeover || params.server_no_context_takeover) {
      accepted.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover !== false && params.client_no_context_takeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof this._options.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = this._options.serverMaxWindowBits;
    } else if (typeof params.server_max_window_bits === 'number') {
      accepted.server_max_window_bits = params.server_max_window_bits;
    }
    if (typeof this._options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === 'number') {
      accepted.client_max_window_bits = params.client_max_window_bits;
    }
    return true;
  }, this);

  if (!result) {
    throw new Error('Doesn\'t support the offered configuration');
  }

  return accepted;
};

/**
 * Accept extension response from server
 *
 * @api privaye
 */

PerMessageDeflate.prototype.acceptAsClient = function(paramsList) {
  var params = paramsList[0];
  if (this._options.clientNoContextTakeover != null) {
    if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
      throw new Error('Invalid value for "client_no_context_takeover"');
    }
  }
  if (this._options.clientMaxWindowBits != null) {
    if (this._options.clientMaxWindowBits === false && params.client_max_window_bits) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }
    if (typeof this._options.clientMaxWindowBits === 'number' &&
        (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits)) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }
  }
  return params;
};

/**
 * Normalize extensions parameters
 *
 * @api private
 */

PerMessageDeflate.prototype.normalizeParams = function(paramsList) {
  return paramsList.map(function(params) {
    Object.keys(params).forEach(function(key) {
      var value = params[key];
      if (value.length > 1) {
        throw new Error('Multiple extension parameters for ' + key);
      }

      value = value[0];

      switch (key) {
      case 'server_no_context_takeover':
      case 'client_no_context_takeover':
        if (value !== true) {
          throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
        }
        params[key] = true;
        break;
      case 'server_max_window_bits':
      case 'client_max_window_bits':
        if (typeof value === 'string') {
          value = parseInt(value, 10);
          if (!~AVAILABLE_WINDOW_BITS.indexOf(value)) {
            throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
          }
        }
        if (!this._isServer && value === true) {
          throw new Error('Missing extension parameter value for ' + key);
        }
        params[key] = value;
        break;
      default:
        throw new Error('Not defined extension parameter (' + key + ')');
      }
    }, this);
    return params;
  }, this);
};

/**
 * Decompress message
 *
 * @api public
 */

PerMessageDeflate.prototype.decompress = function (data, fin, callback) {
  var endpoint = this._isServer ? 'client' : 'server';

  if (!this._inflate) {
    var maxWindowBits = this.params[endpoint + '_max_window_bits'];
    this._inflate = zlib.createInflateRaw({
      windowBits: 'number' === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS
    });
  }
  this._inflate.writeInProgress = true;

  var self = this;
  var buffers = [];
  var cumulativeBufferLength=0;

  this._inflate.on('error', onError).on('data', onData);
  this._inflate.write(data);
  if (fin) {
    this._inflate.write(new Buffer([0x00, 0x00, 0xff, 0xff]));
  }
  this._inflate.flush(function() {
    cleanup();
    callback(null, Buffer.concat(buffers));
  });

  function onError(err) {
    cleanup();
    callback(err);
  }

  function onData(data) {
      if(self._maxPayload!==undefined && self._maxPayload!==null && self._maxPayload>0){
          cumulativeBufferLength+=data.length;
          if(cumulativeBufferLength>self._maxPayload){
            buffers=[];
            cleanup();
            var err={type:1009};
            callback(err);
            return;
          }
      }
      buffers.push(data);
  }

  function cleanup() {
    if (!self._inflate) return;
    self._inflate.removeListener('error', onError);
    self._inflate.removeListener('data', onData);
    self._inflate.writeInProgress = false;
    if ((fin && self.params[endpoint + '_no_context_takeover']) || self._inflate.pendingClose) {
      if (self._inflate.close) self._inflate.close();
      self._inflate = null;
    }
  }
};

/**
 * Compress message
 *
 * @api public
 */

PerMessageDeflate.prototype.compress = function (data, fin, callback) {
  var endpoint = this._isServer ? 'server' : 'client';

  if (!this._deflate) {
    var maxWindowBits = this.params[endpoint + '_max_window_bits'];
    this._deflate = zlib.createDeflateRaw({
      flush: zlib.Z_SYNC_FLUSH,
      windowBits: 'number' === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS,
      memLevel: this._options.memLevel || DEFAULT_MEM_LEVEL
    });
  }
  this._deflate.writeInProgress = true;

  var self = this;
  var buffers = [];

  this._deflate.on('error', onError).on('data', onData);
  this._deflate.write(data);
  this._deflate.flush(function() {
    cleanup();
    var data = Buffer.concat(buffers);
    if (fin) {
      data = data.slice(0, data.length - 4);
    }
    callback(null, data);
  });

  function onError(err) {
    cleanup();
    callback(err);
  }

  function onData(data) {
    buffers.push(data);
  }

  function cleanup() {
    if (!self._deflate) return;
    self._deflate.removeListener('error', onError);
    self._deflate.removeListener('data', onData);
    self._deflate.writeInProgress = false;
    if ((fin && self.params[endpoint + '_no_context_takeover']) || self._deflate.pendingClose) {
      if (self._deflate.close) self._deflate.close();
      self._deflate = null;
    }
  }
};

module.exports = PerMessageDeflate;

},{"zlib":undefined}],15:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util');

/**
 * State constants
 */

var EMPTY = 0
  , BODY = 1;
var BINARYLENGTH = 2
  , BINARYBODY = 3;

/**
 * Hixie Receiver implementation
 */

function Receiver () {
  if (this instanceof Receiver === false) {
    throw new TypeError("Classes can't be function-called");
  }

  this.state = EMPTY;
  this.buffers = [];
  this.messageEnd = -1;
  this.spanLength = 0;
  this.dead = false;

  this.onerror = function() {};
  this.ontext = function() {};
  this.onbinary = function() {};
  this.onclose = function() {};
  this.onping = function() {};
  this.onpong = function() {};
}

module.exports = Receiver;

/**
 * Add new data to the parser.
 *
 * @api public
 */

Receiver.prototype.add = function(data) {
  if (this.dead) return;
  var self = this;
  function doAdd() {
    if (self.state === EMPTY) {
      if (data.length == 2 && data[0] == 0xFF && data[1] == 0x00) {
        self.reset();
        self.onclose();
        return;
      }
      if (data[0] === 0x80) {
        self.messageEnd = 0;
        self.state = BINARYLENGTH;
        data = data.slice(1);
      } else {

      if (data[0] !== 0x00) {
        self.error('payload must start with 0x00 byte', true);
        return;
      }
      data = data.slice(1);
      self.state = BODY;

      }
    }
    if (self.state === BINARYLENGTH) {
      var i = 0;
      while ((i < data.length) && (data[i] & 0x80)) {
        self.messageEnd = 128 * self.messageEnd + (data[i] & 0x7f);
        ++i;
      }
      if (i < data.length) {
        self.messageEnd = 128 * self.messageEnd + (data[i] & 0x7f);
        self.state = BINARYBODY;
        ++i;
      }
      if (i > 0)
        data = data.slice(i);
    }
    if (self.state === BINARYBODY) {
      var dataleft = self.messageEnd - self.spanLength;
      if (data.length >= dataleft) {
        // consume the whole buffer to finish the frame
        self.buffers.push(data);
        self.spanLength += dataleft;
        self.messageEnd = dataleft;
        return self.parse();
      }
      // frame's not done even if we consume it all
      self.buffers.push(data);
      self.spanLength += data.length;
      return;
    }
    self.buffers.push(data);
    if ((self.messageEnd = bufferIndex(data, 0xFF)) != -1) {
      self.spanLength += self.messageEnd;
      return self.parse();
    }
    else self.spanLength += data.length;
  }
  while(data) data = doAdd();
};

/**
 * Releases all resources used by the receiver.
 *
 * @api public
 */

Receiver.prototype.cleanup = function() {
  this.dead = true;
  this.state = EMPTY;
  this.buffers = [];
};

/**
 * Process buffered data.
 *
 * @api public
 */

Receiver.prototype.parse = function() {
  var output = new Buffer(this.spanLength);
  var outputIndex = 0;
  for (var bi = 0, bl = this.buffers.length; bi < bl - 1; ++bi) {
    var buffer = this.buffers[bi];
    buffer.copy(output, outputIndex);
    outputIndex += buffer.length;
  }
  var lastBuffer = this.buffers[this.buffers.length - 1];
  if (this.messageEnd > 0) lastBuffer.copy(output, outputIndex, 0, this.messageEnd);
  if (this.state !== BODY) --this.messageEnd;
  var tail = null;
  if (this.messageEnd < lastBuffer.length - 1) {
    tail = lastBuffer.slice(this.messageEnd + 1);
  }
  this.reset();
  this.ontext(output.toString('utf8'));
  return tail;
};

/**
 * Handles an error
 *
 * @api private
 */

Receiver.prototype.error = function (reason, terminate) {
  if (this.dead) return;
  this.reset();
  if(typeof reason == 'string'){
    this.onerror(new Error(reason), terminate);
  }
  else if(reason.constructor == Error){
    this.onerror(reason, terminate);
  }
  else{
    this.onerror(new Error("An error occured"),terminate);
  }
  return this;
};

/**
 * Reset parser state
 *
 * @api private
 */

Receiver.prototype.reset = function (reason) {
  if (this.dead) return;
  this.state = EMPTY;
  this.buffers = [];
  this.messageEnd = -1;
  this.spanLength = 0;
};

/**
 * Internal api
 */

function bufferIndex(buffer, byte) {
  for (var i = 0, l = buffer.length; i < l; ++i) {
    if (buffer[i] === byte) return i;
  }
  return -1;
}

},{"util":undefined}],16:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util')
  , isValidUTF8 = require('./Validation')
  , ErrorCodes = require('./ErrorCodes')
  , BufferPool = require('./BufferPool')
  , bufferUtil = require('./BufferUtil')
  , PerMessageDeflate = require('./PerMessageDeflate');

/**
 * HyBi Receiver implementation
 */

function Receiver (extensions,maxPayload) {
  if (this instanceof Receiver === false) {
    throw new TypeError("Classes can't be function-called");
  }
  if(typeof extensions==='number'){
    maxPayload=extensions;
    extensions={};
  }


  // memory pool for fragmented messages
  var fragmentedPoolPrevUsed = -1;
  this.fragmentedBufferPool = new BufferPool(1024, function(db, length) {
    return db.used + length;
  }, function(db) {
    return fragmentedPoolPrevUsed = fragmentedPoolPrevUsed >= 0 ?
      Math.ceil((fragmentedPoolPrevUsed + db.used) / 2) :
      db.used;
  });

  // memory pool for unfragmented messages
  var unfragmentedPoolPrevUsed = -1;
  this.unfragmentedBufferPool = new BufferPool(1024, function(db, length) {
    return db.used + length;
  }, function(db) {
    return unfragmentedPoolPrevUsed = unfragmentedPoolPrevUsed >= 0 ?
      Math.ceil((unfragmentedPoolPrevUsed + db.used) / 2) :
      db.used;
  });
  this.extensions = extensions || {};
  this.maxPayload = maxPayload || 0;
  this.currentPayloadLength = 0;
  this.state = {
    activeFragmentedOperation: null,
    lastFragment: false,
    masked: false,
    opcode: 0,
    fragmentedOperation: false
  };
  this.overflow = [];
  this.headerBuffer = new Buffer(10);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.currentMessage = [];
  this.currentMessageLength = 0;
  this.messageHandlers = [];
  this.expectHeader(2, this.processPacket);
  this.dead = false;
  this.processing = false;

  this.onerror = function() {};
  this.ontext = function() {};
  this.onbinary = function() {};
  this.onclose = function() {};
  this.onping = function() {};
  this.onpong = function() {};
}

module.exports = Receiver;

/**
 * Add new data to the parser.
 *
 * @api public
 */

Receiver.prototype.add = function(data) {
  if (this.dead) return;
  var dataLength = data.length;
  if (dataLength == 0) return;
  if (this.expectBuffer == null) {
    this.overflow.push(data);
    return;
  }
  var toRead = Math.min(dataLength, this.expectBuffer.length - this.expectOffset);
  fastCopy(toRead, data, this.expectBuffer, this.expectOffset);
  this.expectOffset += toRead;
  if (toRead < dataLength) {
    this.overflow.push(data.slice(toRead));
  }
  while (this.expectBuffer && this.expectOffset == this.expectBuffer.length) {
    var bufferForHandler = this.expectBuffer;
    this.expectBuffer = null;
    this.expectOffset = 0;
    this.expectHandler.call(this, bufferForHandler);
  }
};

/**
 * Releases all resources used by the receiver.
 *
 * @api public
 */

Receiver.prototype.cleanup = function() {
  this.dead = true;
  this.overflow = null;
  this.headerBuffer = null;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.unfragmentedBufferPool = null;
  this.fragmentedBufferPool = null;
  this.state = null;
  this.currentMessage = null;
  this.onerror = null;
  this.ontext = null;
  this.onbinary = null;
  this.onclose = null;
  this.onping = null;
  this.onpong = null;
};

/**
 * Waits for a certain amount of header bytes to be available, then fires a callback.
 *
 * @api private
 */

Receiver.prototype.expectHeader = function(length, handler) {
  if (length == 0) {
    handler(null);
    return;
  }
  this.expectBuffer = this.headerBuffer.slice(this.expectOffset, this.expectOffset + length);
  this.expectHandler = handler;
  var toRead = length;
  while (toRead > 0 && this.overflow.length > 0) {
    var fromOverflow = this.overflow.pop();
    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
    var read = Math.min(fromOverflow.length, toRead);
    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
    this.expectOffset += read;
    toRead -= read;
  }
};

/**
 * Waits for a certain amount of data bytes to be available, then fires a callback.
 *
 * @api private
 */

Receiver.prototype.expectData = function(length, handler) {
  if (length == 0) {
    handler(null);
    return;
  }
  this.expectBuffer = this.allocateFromPool(length, this.state.fragmentedOperation);
  this.expectHandler = handler;
  var toRead = length;
  while (toRead > 0 && this.overflow.length > 0) {
    var fromOverflow = this.overflow.pop();
    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
    var read = Math.min(fromOverflow.length, toRead);
    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
    this.expectOffset += read;
    toRead -= read;
  }
};

/**
 * Allocates memory from the buffer pool.
 *
 * @api private
 */

Receiver.prototype.allocateFromPool = function(length, isFragmented) {
  return (isFragmented ? this.fragmentedBufferPool : this.unfragmentedBufferPool).get(length);
};

/**
 * Start processing a new packet.
 *
 * @api private
 */

Receiver.prototype.processPacket = function (data) {
  if (this.extensions[PerMessageDeflate.extensionName]) {
    if ((data[0] & 0x30) != 0) {
      this.error('reserved fields (2, 3) must be empty', 1002);
      return;
    }
  } else {
    if ((data[0] & 0x70) != 0) {
      this.error('reserved fields must be empty', 1002);
      return;
    }
  }
  this.state.lastFragment = (data[0] & 0x80) == 0x80;
  this.state.masked = (data[1] & 0x80) == 0x80;
  var compressed = (data[0] & 0x40) == 0x40;
  var opcode = data[0] & 0xf;
  if (opcode === 0) {
    if (compressed) {
      this.error('continuation frame cannot have the Per-message Compressed bits', 1002);
      return;
    }
    // continuation frame
    this.state.fragmentedOperation = true;
    this.state.opcode = this.state.activeFragmentedOperation;
    if (!(this.state.opcode == 1 || this.state.opcode == 2)) {
      this.error('continuation frame cannot follow current opcode', 1002);
      return;
    }
  }
  else {
    if (opcode < 3 && this.state.activeFragmentedOperation != null) {
      this.error('data frames after the initial data frame must have opcode 0', 1002);
      return;
    }
    if (opcode >= 8 && compressed) {
      this.error('control frames cannot have the Per-message Compressed bits', 1002);
      return;
    }
    this.state.compressed = compressed;
    this.state.opcode = opcode;
    if (this.state.lastFragment === false) {
      this.state.fragmentedOperation = true;
      this.state.activeFragmentedOperation = opcode;
    }
    else this.state.fragmentedOperation = false;
  }
  var handler = opcodes[this.state.opcode];
  if (typeof handler == 'undefined') this.error('no handler for opcode ' + this.state.opcode, 1002);
  else {
    handler.start.call(this, data);
  }
};

/**
 * Endprocessing a packet.
 *
 * @api private
 */

Receiver.prototype.endPacket = function() {
  if (this.dead) return;
  if (!this.state.fragmentedOperation) this.unfragmentedBufferPool.reset(true);
  else if (this.state.lastFragment) this.fragmentedBufferPool.reset(true);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  if (this.state.lastFragment && this.state.opcode === this.state.activeFragmentedOperation) {
    // end current fragmented operation
    this.state.activeFragmentedOperation = null;
  }
  this.currentPayloadLength = 0;
  this.state.lastFragment = false;
  this.state.opcode = this.state.activeFragmentedOperation != null ? this.state.activeFragmentedOperation : 0;
  this.state.masked = false;
  this.expectHeader(2, this.processPacket);
};

/**
 * Reset the parser state.
 *
 * @api private
 */

Receiver.prototype.reset = function() {
  if (this.dead) return;
  this.state = {
    activeFragmentedOperation: null,
    lastFragment: false,
    masked: false,
    opcode: 0,
    fragmentedOperation: false
  };
  this.fragmentedBufferPool.reset(true);
  this.unfragmentedBufferPool.reset(true);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.overflow = [];
  this.currentMessage = [];
  this.currentMessageLength = 0;
  this.messageHandlers = [];
  this.currentPayloadLength = 0;
};

/**
 * Unmask received data.
 *
 * @api private
 */

Receiver.prototype.unmask = function (mask, buf, binary) {
  if (mask != null && buf != null) bufferUtil.unmask(buf, mask);
  if (binary) return buf;
  return buf != null ? buf.toString('utf8') : '';
};

/**
 * Handles an error
 *
 * @api private
 */

Receiver.prototype.error = function (reason, protocolErrorCode) {
  if (this.dead) return;
  this.reset();
  if(typeof reason == 'string'){
    this.onerror(new Error(reason), protocolErrorCode);
  }
  else if(reason.constructor == Error){
    this.onerror(reason, protocolErrorCode);
  }
  else{
    this.onerror(new Error("An error occured"),protocolErrorCode);
  }
  return this;
};

/**
 * Execute message handler buffers
 *
 * @api private
 */

Receiver.prototype.flush = function() {
  if (this.processing || this.dead) return;

  var handler = this.messageHandlers.shift();
  if (!handler) return;

  this.processing = true;
  var self = this;

  handler(function() {
    self.processing = false;
    self.flush();
  });
};

/**
 * Apply extensions to message
 *
 * @api private
 */

Receiver.prototype.applyExtensions = function(messageBuffer, fin, compressed, callback) {
  var self = this;
  if (compressed) {
    this.extensions[PerMessageDeflate.extensionName].decompress(messageBuffer, fin, function(err, buffer) {
      if (self.dead) return;
      if (err) {
        callback(new Error('invalid compressed data'));
        return;
      }
      callback(null, buffer);
    });
  } else {
    callback(null, messageBuffer);
  }
};

/**
* Checks payload size, disconnects socket when it exceeds maxPayload
*
* @api private
*/
Receiver.prototype.maxPayloadExceeded = function(length) {
  if (this.maxPayload=== undefined || this.maxPayload === null || this.maxPayload < 1) {
    return false;
  }
  var fullLength = this.currentPayloadLength + length;
  if (fullLength < this.maxPayload) {
    this.currentPayloadLength = fullLength;
    return false;
  }
  this.error('payload cannot exceed ' + this.maxPayload + ' bytes', 1009);
  this.messageBuffer=[];
  this.cleanup();

  return true;
};

/**
 * Buffer utilities
 */

function readUInt16BE(start) {
  return (this[start]<<8) +
         this[start+1];
}

function readUInt32BE(start) {
  return (this[start]<<24) +
         (this[start+1]<<16) +
         (this[start+2]<<8) +
         this[start+3];
}

function fastCopy(length, srcBuffer, dstBuffer, dstOffset) {
  switch (length) {
    default: srcBuffer.copy(dstBuffer, dstOffset, 0, length); break;
    case 16: dstBuffer[dstOffset+15] = srcBuffer[15];
    case 15: dstBuffer[dstOffset+14] = srcBuffer[14];
    case 14: dstBuffer[dstOffset+13] = srcBuffer[13];
    case 13: dstBuffer[dstOffset+12] = srcBuffer[12];
    case 12: dstBuffer[dstOffset+11] = srcBuffer[11];
    case 11: dstBuffer[dstOffset+10] = srcBuffer[10];
    case 10: dstBuffer[dstOffset+9] = srcBuffer[9];
    case 9: dstBuffer[dstOffset+8] = srcBuffer[8];
    case 8: dstBuffer[dstOffset+7] = srcBuffer[7];
    case 7: dstBuffer[dstOffset+6] = srcBuffer[6];
    case 6: dstBuffer[dstOffset+5] = srcBuffer[5];
    case 5: dstBuffer[dstOffset+4] = srcBuffer[4];
    case 4: dstBuffer[dstOffset+3] = srcBuffer[3];
    case 3: dstBuffer[dstOffset+2] = srcBuffer[2];
    case 2: dstBuffer[dstOffset+1] = srcBuffer[1];
    case 1: dstBuffer[dstOffset] = srcBuffer[0];
  }
}

function clone(obj) {
  var cloned = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      cloned[k] = obj[k];
    }
  }
  return cloned;
}

/**
 * Opcode handlers
 */

var opcodes = {
  // text
  '1': {
    start: function(data) {
      var self = this;
      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        if (self.maxPayloadExceeded(firstLength)){
          self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
          return;
        }
        opcodes['1'].getData.call(self, firstLength);
      }
      else if (firstLength == 126) {
        self.expectHeader(2, function(data) {
          var length = readUInt16BE.call(data, 0);
          if (self.maxPayloadExceeded(length)){
            self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['1'].getData.call(self, length);
        });
      }
      else if (firstLength == 127) {
        self.expectHeader(8, function(data) {
          if (readUInt32BE.call(data, 0) != 0) {
            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
            return;
          }
          var length = readUInt32BE.call(data, 4);
          if (self.maxPayloadExceeded(length)){
            self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['1'].getData.call(self, readUInt32BE.call(data, 4));
        });
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['1'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['1'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      var packet = this.unmask(mask, data, true) || new Buffer(0);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
          if (err) {
            if(err.type===1009){
                return self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            }
            return self.error(err.message, 1007);
          }
          if (buffer != null) {
            if( self.maxPayload==0 || (self.maxPayload > 0 && (self.currentMessageLength + buffer.length) < self.maxPayload) ){
              self.currentMessage.push(buffer);
            }
            else{
                self.currentMessage=null;
                self.currentMessage = [];
                self.currentMessageLength = 0;
                self.error(new Error('Maximum payload exceeded. maxPayload: '+self.maxPayload), 1009);
                return;
            }
            self.currentMessageLength += buffer.length;
          }
          if (state.lastFragment) {
            var messageBuffer = Buffer.concat(self.currentMessage);
            self.currentMessage = [];
            self.currentMessageLength = 0;
            if (!isValidUTF8(messageBuffer)) {
              self.error('invalid utf8 sequence', 1007);
              return;
            }
            self.ontext(messageBuffer.toString('utf8'), {masked: state.masked, buffer: messageBuffer});
          }
          callback();
        });
      });
      this.flush();
      this.endPacket();
    }
  },
  // binary
  '2': {
    start: function(data) {
      var self = this;
      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
          if (self.maxPayloadExceeded(firstLength)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
        opcodes['2'].getData.call(self, firstLength);
      }
      else if (firstLength == 126) {
        self.expectHeader(2, function(data) {
          var length = readUInt16BE.call(data, 0);
          if (self.maxPayloadExceeded(length)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['2'].getData.call(self, length);
        });
      }
      else if (firstLength == 127) {
        self.expectHeader(8, function(data) {
          if (readUInt32BE.call(data, 0) != 0) {
            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
            return;
          }
          var length = readUInt32BE.call(data, 4, true);
          if (self.maxPayloadExceeded(length)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['2'].getData.call(self, length);
        });
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['2'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['2'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      var packet = this.unmask(mask, data, true) || new Buffer(0);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
          if (err) {
            if(err.type===1009){
                return self.error('Max payload exceeded in compressed binary message. Aborting...', 1009);
            }
            return self.error(err.message, 1007);
          }
          if (buffer != null) {
            if( self.maxPayload==0 || (self.maxPayload > 0 && (self.currentMessageLength + buffer.length) < self.maxPayload) ){
              self.currentMessage.push(buffer);
            }
            else{
                self.currentMessage=null;
                self.currentMessage = [];
                self.currentMessageLength = 0;
                self.error(new Error('Maximum payload exceeded'), 1009);
                return;
            }
            self.currentMessageLength += buffer.length;
          }
          if (state.lastFragment) {
            var messageBuffer = Buffer.concat(self.currentMessage);
            self.currentMessage = [];
            self.currentMessageLength = 0;
            self.onbinary(messageBuffer, {masked: state.masked, buffer: messageBuffer});
          }
          callback();
        });
      });
      this.flush();
      this.endPacket();
    }
  },
  // close
  '8': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented close is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['8'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['8'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['8'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = self.unmask(mask, data, true);

      var state = clone(this.state);
      this.messageHandlers.push(function() {
        if (data && data.length == 1) {
          self.error('close packets with data must be at least two bytes long', 1002);
          return;
        }
        var code = data && data.length > 1 ? readUInt16BE.call(data, 0) : 1000;
        if (!ErrorCodes.isValidErrorCode(code)) {
          self.error('invalid error code', 1002);
          return;
        }
        var message = '';
        if (data && data.length > 2) {
          var messageBuffer = data.slice(2);
          if (!isValidUTF8(messageBuffer)) {
            self.error('invalid utf8 sequence', 1007);
            return;
          }
          message = messageBuffer.toString('utf8');
        }
        self.onclose(code, message, {masked: state.masked});
        self.reset();
      });
      this.flush();
    },
  },
  // ping
  '9': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented ping is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['9'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['9'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['9'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = this.unmask(mask, data, true);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.onping(data, {masked: state.masked, binary: true});
        callback();
      });
      this.flush();
      this.endPacket();
    }
  },
  // pong
  '10': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented pong is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['10'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (this.state.masked) {
        this.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['10'].finish.call(self, mask, data);
          });
        });
      }
      else {
        this.expectData(length, function(data) {
          opcodes['10'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = self.unmask(mask, data, true);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.onpong(data, {masked: state.masked, binary: true});
        callback();
      });
      this.flush();
      this.endPacket();
    }
  }
}

},{"./BufferPool":9,"./BufferUtil":11,"./ErrorCodes":12,"./PerMessageDeflate":14,"./Validation":20,"util":undefined}],17:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var events = require('events')
  , util = require('util')
  , EventEmitter = events.EventEmitter;

/**
 * Hixie Sender implementation
 */

function Sender(socket) {
  if (this instanceof Sender === false) {
    throw new TypeError("Classes can't be function-called");
  }

  events.EventEmitter.call(this);

  this.socket = socket;
  this.continuationFrame = false;
  this.isClosed = false;
}

module.exports = Sender;

/**
 * Inherits from EventEmitter.
 */

util.inherits(Sender, events.EventEmitter);

/**
 * Frames and writes data.
 *
 * @api public
 */

Sender.prototype.send = function(data, options, cb) {
  if (this.isClosed) return;

  var isString = typeof data == 'string'
    , length = isString ? Buffer.byteLength(data) : data.length
    , lengthbytes = (length > 127) ? 2 : 1 // assume less than 2**14 bytes
    , writeStartMarker = this.continuationFrame == false
    , writeEndMarker = !options || !(typeof options.fin != 'undefined' && !options.fin)
    , buffer = new Buffer((writeStartMarker ? ((options && options.binary) ? (1 + lengthbytes) : 1) : 0) + length + ((writeEndMarker && !(options && options.binary)) ? 1 : 0))
    , offset = writeStartMarker ? 1 : 0;

  if (writeStartMarker) {
    if (options && options.binary) {
      buffer.write('\x80', 'binary');
      // assume length less than 2**14 bytes
      if (lengthbytes > 1)
        buffer.write(String.fromCharCode(128+length/128), offset++, 'binary');
      buffer.write(String.fromCharCode(length&0x7f), offset++, 'binary');
    } else
      buffer.write('\x00', 'binary');
  }

  if (isString) buffer.write(data, offset, 'utf8');
  else data.copy(buffer, offset, 0);

  if (writeEndMarker) {
    if (options && options.binary) {
      // sending binary, not writing end marker
    } else
      buffer.write('\xff', offset + length, 'binary');
    this.continuationFrame = false;
  }
  else this.continuationFrame = true;

  try {
    this.socket.write(buffer, 'binary', cb);
  } catch (e) {
    this.error(e.toString());
  }
};

/**
 * Sends a close instruction to the remote party.
 *
 * @api public
 */

Sender.prototype.close = function(code, data, mask, cb) {
  if (this.isClosed) return;
  this.isClosed = true;
  try {
    if (this.continuationFrame) this.socket.write(new Buffer([0xff], 'binary'));
    this.socket.write(new Buffer([0xff, 0x00]), 'binary', cb);
  } catch (e) {
    this.error(e.toString());
  }
};

/**
 * Sends a ping message to the remote party. Not available for hixie.
 *
 * @api public
 */

Sender.prototype.ping = function(data, options) {};

/**
 * Sends a pong message to the remote party. Not available for hixie.
 *
 * @api public
 */

Sender.prototype.pong = function(data, options) {};

/**
 * Handles an error
 *
 * @api private
 */

Sender.prototype.error = function (reason) {
  this.emit('error', reason);
  return this;
};

},{"events":undefined,"util":undefined}],18:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var events = require('events')
  , util = require('util')
  , crypto = require('crypto')
  , EventEmitter = events.EventEmitter
  , ErrorCodes = require('./ErrorCodes')
  , bufferUtil = require('./BufferUtil')
  , PerMessageDeflate = require('./PerMessageDeflate');

/**
 * HyBi Sender implementation
 */

function Sender(socket, extensions) {
  if (this instanceof Sender === false) {
    throw new TypeError("Classes can't be function-called");
  }

  events.EventEmitter.call(this);

  this._socket = socket;
  this.extensions = extensions || {};
  this.firstFragment = true;
  this.compress = false;
  this.messageHandlers = [];
  this.processing = false;
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Sender, events.EventEmitter);

/**
 * Sends a close instruction to the remote party.
 *
 * @api public
 */

Sender.prototype.close = function(code, data, mask, cb) {
  if (typeof code !== 'undefined') {
    if (typeof code !== 'number' ||
      !ErrorCodes.isValidErrorCode(code)) throw new Error('first argument must be a valid error code number');
  }
  code = code || 1000;
  var dataBuffer = new Buffer(2 + (data ? Buffer.byteLength(data) : 0));
  writeUInt16BE.call(dataBuffer, code, 0);
  if (dataBuffer.length > 2) dataBuffer.write(data, 2);

  var self = this;
  this.messageHandlers.push(function() {
    self.frameAndSend(0x8, dataBuffer, true, mask);
    if (typeof cb == 'function') cb();
  });
  this.flush();
};

/**
 * Sends a ping message to the remote party.
 *
 * @api public
 */

Sender.prototype.ping = function(data, options) {
  var mask = options && options.mask;
  var self = this;
  this.messageHandlers.push(function() {
    self.frameAndSend(0x9, data || '', true, mask);
  });
  this.flush();
};

/**
 * Sends a pong message to the remote party.
 *
 * @api public
 */

Sender.prototype.pong = function(data, options) {
  var mask = options && options.mask;
  var self = this;
  this.messageHandlers.push(function() {
    self.frameAndSend(0xa, data || '', true, mask);
  });
  this.flush();
};

/**
 * Sends text or binary data to the remote party.
 *
 * @api public
 */

Sender.prototype.send = function(data, options, cb) {
  var finalFragment = options && options.fin === false ? false : true;
  var mask = options && options.mask;
  var compress = options && options.compress;
  var opcode = options && options.binary ? 2 : 1;
  if (this.firstFragment === false) {
    opcode = 0;
    compress = false;
  } else {
    this.firstFragment = false;
    this.compress = compress;
  }
  if (finalFragment) this.firstFragment = true

  var compressFragment = this.compress;

  var self = this;
  this.messageHandlers.push(function() {
    if (!data || !compressFragment) {
      self.frameAndSend(opcode, data, finalFragment, mask, compress, cb);
      return;
    }

    self.processing = true;
    self.applyExtensions(data, finalFragment, compressFragment, function(err, data) {
      if (err) {
        if (typeof cb == 'function') cb(err);
        else self.emit('error', err);
        return;
      }
      self.frameAndSend(opcode, data, finalFragment, mask, compress, cb);
      self.processing = false;
      self.flush();
    });
  });
  this.flush();
};

/**
 * Frames and sends a piece of data according to the HyBi WebSocket protocol.
 *
 * @api private
 */

Sender.prototype.frameAndSend = function(opcode, data, finalFragment, maskData, compressed, cb) {
  var canModifyData = false;

  if (!data) {
    try {
      this._socket.write(new Buffer([opcode | (finalFragment ? 0x80 : 0), 0 | (maskData ? 0x80 : 0)].concat(maskData ? [0, 0, 0, 0] : [])), 'binary', cb);
    }
    catch (e) {
      if (typeof cb == 'function') cb(e);
      else this.emit('error', e);
    }
    return;
  }

  if (!Buffer.isBuffer(data)) {
    canModifyData = true;
    if (data && (typeof data.byteLength !== 'undefined' || typeof data.buffer !== 'undefined')) {
      data = getArrayBuffer(data);
    } else {
      //
      // If people want to send a number, this would allocate the number in
      // bytes as memory size instead of storing the number as buffer value. So
      // we need to transform it to string in order to prevent possible
      // vulnerabilities / memory attacks.
      //
      if (typeof data === 'number') data = data.toString();

      data = new Buffer(data);
    }
  }

  var dataLength = data.length
    , dataOffset = maskData ? 6 : 2
    , secondByte = dataLength;

  if (dataLength >= 65536) {
    dataOffset += 8;
    secondByte = 127;
  }
  else if (dataLength > 125) {
    dataOffset += 2;
    secondByte = 126;
  }

  var mergeBuffers = dataLength < 32768 || (maskData && !canModifyData);
  var totalLength = mergeBuffers ? dataLength + dataOffset : dataOffset;
  var outputBuffer = new Buffer(totalLength);
  outputBuffer[0] = finalFragment ? opcode | 0x80 : opcode;
  if (compressed) outputBuffer[0] |= 0x40;

  switch (secondByte) {
    case 126:
      writeUInt16BE.call(outputBuffer, dataLength, 2);
      break;
    case 127:
      writeUInt32BE.call(outputBuffer, 0, 2);
      writeUInt32BE.call(outputBuffer, dataLength, 6);
  }

  if (maskData) {
    outputBuffer[1] = secondByte | 0x80;
    var mask = getRandomMask();
    outputBuffer[dataOffset - 4] = mask[0];
    outputBuffer[dataOffset - 3] = mask[1];
    outputBuffer[dataOffset - 2] = mask[2];
    outputBuffer[dataOffset - 1] = mask[3];
    if (mergeBuffers) {
      bufferUtil.mask(data, mask, outputBuffer, dataOffset, dataLength);
      try {
        this._socket.write(outputBuffer, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
    else {
      bufferUtil.mask(data, mask, data, 0, dataLength);
      try {
        this._socket.write(outputBuffer, 'binary');
        this._socket.write(data, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
  }
  else {
    outputBuffer[1] = secondByte;
    if (mergeBuffers) {
      data.copy(outputBuffer, dataOffset);
      try {
        this._socket.write(outputBuffer, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
    else {
      try {
        this._socket.write(outputBuffer, 'binary');
        this._socket.write(data, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
  }
};

/**
 * Execute message handler buffers
 *
 * @api private
 */

Sender.prototype.flush = function() {
  while (!this.processing && this.messageHandlers.length) {
    this.messageHandlers.shift()();
  }
};

/**
 * Apply extensions to message
 *
 * @api private
 */

Sender.prototype.applyExtensions = function(data, fin, compress, callback) {
  if ((data.buffer || data) instanceof ArrayBuffer) {
    data = getArrayBuffer(data);
  }
  this.extensions[PerMessageDeflate.extensionName].compress(data, fin, callback);
};

module.exports = Sender;

function writeUInt16BE(value, offset) {
  this[offset] = (value & 0xff00)>>8;
  this[offset+1] = value & 0xff;
}

function writeUInt32BE(value, offset) {
  this[offset] = (value & 0xff000000)>>24;
  this[offset+1] = (value & 0xff0000)>>16;
  this[offset+2] = (value & 0xff00)>>8;
  this[offset+3] = value & 0xff;
}

function getArrayBuffer(data) {
  // data is either an ArrayBuffer or ArrayBufferView.
  var array = new Uint8Array(data.buffer || data)
    , l = data.byteLength || data.length
    , o = data.byteOffset || 0
    , buffer = new Buffer(l);
  for (var i = 0; i < l; ++i) {
    buffer[i] = array[o+i];
  }
  return buffer;
}

function getRandomMask() {
  return crypto.randomBytes(4);
}

},{"./BufferUtil":11,"./ErrorCodes":12,"./PerMessageDeflate":14,"crypto":undefined,"events":undefined,"util":undefined}],19:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

exports.Validation = {
  isValidUTF8: function(buffer) {
    return true;
  }
};

},{}],20:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var isValidUTF8;

try {
  isValidUTF8 = require('utf-8-validate');
} catch (e) {
  isValidUTF8 = require('./Validation.fallback');
}

module.exports = typeof isValidUTF8 === 'object'
  ? isValidUTF8.Validation.isValidUTF8
  : isValidUTF8;

},{"./Validation.fallback":19,"utf-8-validate":7}],21:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var url = require('url')
  , util = require('util')
  , http = require('http')
  , https = require('https')
  , crypto = require('crypto')
  , stream = require('stream')
  , Ultron = require('ultron')
  , Options = require('options')
  , Sender = require('./Sender')
  , Receiver = require('./Receiver')
  , SenderHixie = require('./Sender.hixie')
  , ReceiverHixie = require('./Receiver.hixie')
  , Extensions = require('./Extensions')
  , PerMessageDeflate = require('./PerMessageDeflate')
  , EventEmitter = require('events').EventEmitter;

/**
 * Constants
 */

// Default protocol version

var protocolVersion = 13;

// Close timeout

var closeTimeout = 30 * 1000; // Allow 30 seconds to terminate the connection cleanly

/**
 * WebSocket implementation
 *
 * @constructor
 * @param {String} address Connection address.
 * @param {String|Array} protocols WebSocket protocols.
 * @param {Object} options Additional connection options.
 * @api public
 */
function WebSocket(address, protocols, options) {
  if (this instanceof WebSocket === false) {
    return new WebSocket(address, protocols, options);
  }

  EventEmitter.call(this);

  if (protocols && !Array.isArray(protocols) && 'object' === typeof protocols) {
    // accept the "options" Object as the 2nd argument
    options = protocols;
    protocols = null;
  }

  if ('string' === typeof protocols) {
    protocols = [ protocols ];
  }

  if (!Array.isArray(protocols)) {
    protocols = [];
  }

  this._socket = null;
  this._ultron = null;
  this._closeReceived = false;
  this.bytesReceived = 0;
  this.readyState = null;
  this.supports = {};
  this.extensions = {};
  this._binaryType = 'nodebuffer';

  if (Array.isArray(address)) {
    initAsServerClient.apply(this, address.concat(options));
  } else {
    initAsClient.apply(this, [address, protocols, options]);
  }
}

/**
 * Inherits from EventEmitter.
 */
util.inherits(WebSocket, EventEmitter);

/**
 * Ready States
 */
["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function each(state, index) {
    WebSocket.prototype[state] = WebSocket[state] = index;
});

/**
 * Gracefully closes the connection, after sending a description message to the server
 *
 * @param {Object} data to be sent to the server
 * @api public
 */
WebSocket.prototype.close = function close(code, data) {
  if (this.readyState === WebSocket.CLOSED) return;

  if (this.readyState === WebSocket.CONNECTING) {
    this.readyState = WebSocket.CLOSED;
    return;
  }

  if (this.readyState === WebSocket.CLOSING) {
    if (this._closeReceived && this._isServer) {
      this.terminate();
    }
    return;
  }

  var self = this;
  try {
    this.readyState = WebSocket.CLOSING;
    this._closeCode = code;
    this._closeMessage = data;
    var mask = !this._isServer;
    this._sender.close(code, data, mask, function(err) {
      if (err) self.emit('error', err);

      if (self._closeReceived && self._isServer) {
        self.terminate();
      } else {
        // ensure that the connection is cleaned up even when no response of closing handshake.
        clearTimeout(self._closeTimer);
        self._closeTimer = setTimeout(cleanupWebsocketResources.bind(self, true), closeTimeout);
      }
    });
  } catch (e) {
    this.emit('error', e);
  }
};

/**
 * Pause the client stream
 *
 * @api public
 */
WebSocket.prototype.pause = function pauser() {
  if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

  return this._socket.pause();
};

/**
 * Sends a ping
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean
 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
 * @api public
 */
WebSocket.prototype.ping = function ping(data, options, dontFailWhenClosed) {
  if (this.readyState !== WebSocket.OPEN) {
    if (dontFailWhenClosed === true) return;
    throw new Error('not opened');
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;

  this._sender.ping(data, options);
};

/**
 * Sends a pong
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean
 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
 * @api public
 */
WebSocket.prototype.pong = function(data, options, dontFailWhenClosed) {
  if (this.readyState !== WebSocket.OPEN) {
    if (dontFailWhenClosed === true) return;
    throw new Error('not opened');
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;

  this._sender.pong(data, options);
};

/**
 * Resume the client stream
 *
 * @api public
 */
WebSocket.prototype.resume = function resume() {
  if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

  return this._socket.resume();
};

/**
 * Sends a piece of data
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
 * @param {function} Optional callback which is executed after the send completes
 * @api public
 */

WebSocket.prototype.send = function send(data, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (this.readyState !== WebSocket.OPEN) {
    if (typeof cb === 'function') cb(new Error('not opened'));
    else throw new Error('not opened');
    return;
  }

  if (!data) data = '';
  if (this._queue) {
    var self = this;
    this._queue.push(function() { self.send(data, options, cb); });
    return;
  }

  options = options || {};
  options.fin = true;

  if (typeof options.binary === 'undefined') {
    options.binary = (data instanceof ArrayBuffer || data instanceof Buffer ||
      data instanceof Uint8Array ||
      data instanceof Uint16Array ||
      data instanceof Uint32Array ||
      data instanceof Int8Array ||
      data instanceof Int16Array ||
      data instanceof Int32Array ||
      data instanceof Float32Array ||
      data instanceof Float64Array);
  }

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;
  if (typeof options.compress === 'undefined') options.compress = true;
  if (!this.extensions[PerMessageDeflate.extensionName]) {
    options.compress = false;
  }

  var readable = typeof stream.Readable === 'function'
    ? stream.Readable
    : stream.Stream;

  if (data instanceof readable) {
    startQueue(this);
    var self = this;

    sendStream(this, data, options, function send(error) {
      process.nextTick(function tock() {
        executeQueueSends(self);
      });

      if (typeof cb === 'function') cb(error);
    });
  } else {
    this._sender.send(data, options, cb);
  }
};

/**
 * Streams data through calls to a user supplied function
 *
 * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
 * @param {function} 'function (error, send)' which is executed on successive ticks of which send is 'function (data, final)'.
 * @api public
 */
WebSocket.prototype.stream = function stream(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var self = this;

  if (typeof cb !== 'function') throw new Error('callback must be provided');

  if (this.readyState !== WebSocket.OPEN) {
    if (typeof cb === 'function') cb(new Error('not opened'));
    else throw new Error('not opened');
    return;
  }

  if (this._queue) {
    this._queue.push(function () { self.stream(options, cb); });
    return;
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;
  if (typeof options.compress === 'undefined') options.compress = true;
  if (!this.extensions[PerMessageDeflate.extensionName]) {
    options.compress = false;
  }

  startQueue(this);

  function send(data, final) {
    try {
      if (self.readyState !== WebSocket.OPEN) throw new Error('not opened');
      options.fin = final === true;
      self._sender.send(data, options);
      if (!final) process.nextTick(cb.bind(null, null, send));
      else executeQueueSends(self);
    } catch (e) {
      if (typeof cb === 'function') cb(e);
      else {
        delete self._queue;
        self.emit('error', e);
      }
    }
  }

  process.nextTick(cb.bind(null, null, send));
};

/**
 * Immediately shuts down the connection
 *
 * @api public
 */
WebSocket.prototype.terminate = function terminate() {
  if (this.readyState === WebSocket.CLOSED) return;

  if (this._socket) {
    this.readyState = WebSocket.CLOSING;

    // End the connection
    try { this._socket.end(); }
    catch (e) {
      // Socket error during end() call, so just destroy it right now
      cleanupWebsocketResources.call(this, true);
      return;
    }

    // Add a timeout to ensure that the connection is completely
    // cleaned up within 30 seconds, even if the clean close procedure
    // fails for whatever reason
    // First cleanup any pre-existing timeout from an earlier "terminate" call,
    // if one exists.  Otherwise terminate calls in quick succession will leak timeouts
    // and hold the program open for `closeTimout` time.
    if (this._closeTimer) { clearTimeout(this._closeTimer); }
    this._closeTimer = setTimeout(cleanupWebsocketResources.bind(this, true), closeTimeout);
  } else if (this.readyState === WebSocket.CONNECTING) {
    cleanupWebsocketResources.call(this, true);
  }
};

/**
 * Expose bufferedAmount
 *
 * @api public
 */
Object.defineProperty(WebSocket.prototype, 'bufferedAmount', {
  get: function get() {
    var amount = 0;
    if (this._socket) {
      amount = this._socket.bufferSize || 0;
    }
    return amount;
  }
});

/**
 * Expose binaryType
 *
 * This deviates from the W3C interface since ws doesn't support the required
 * default "blob" type (instead we define a custom "nodebuffer" type).
 *
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
Object.defineProperty(WebSocket.prototype, 'binaryType', {
  get: function get() {
    return this._binaryType;
  },
  set: function set(type) {
    if (type === 'arraybuffer' || type === 'nodebuffer')
      this._binaryType = type;
    else
      throw new SyntaxError('unsupported binaryType: must be either "nodebuffer" or "arraybuffer"');
  }
});

/**
 * Emulates the W3C Browser based WebSocket interface using function members.
 *
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
['open', 'error', 'close', 'message'].forEach(function(method) {
  Object.defineProperty(WebSocket.prototype, 'on' + method, {
    /**
     * Returns the current listener
     *
     * @returns {Mixed} the set function or undefined
     * @api public
     */
    get: function get() {
      var listener = this.listeners(method)[0];
      return listener ? (listener._listener ? listener._listener : listener) : undefined;
    },

    /**
     * Start listening for events
     *
     * @param {Function} listener the listener
     * @returns {Mixed} the set function or undefined
     * @api public
     */
    set: function set(listener) {
      this.removeAllListeners(method);
      this.addEventListener(method, listener);
    }
  });
});

/**
 * Emulates the W3C Browser based WebSocket interface using addEventListener.
 *
 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
WebSocket.prototype.addEventListener = function(method, listener) {
  var target = this;

  function onMessage (data, flags) {
    if (flags.binary && this.binaryType === 'arraybuffer')
        data = new Uint8Array(data).buffer;
    listener.call(target, new MessageEvent(data, !!flags.binary, target));
  }

  function onClose (code, message) {
    listener.call(target, new CloseEvent(code, message, target));
  }

  function onError (event) {
    event.type = 'error';
    event.target = target;
    listener.call(target, event);
  }

  function onOpen () {
    listener.call(target, new OpenEvent(target));
  }

  if (typeof listener === 'function') {
    if (method === 'message') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onMessage._listener = listener;
      this.on(method, onMessage);
    } else if (method === 'close') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onClose._listener = listener;
      this.on(method, onClose);
    } else if (method === 'error') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onError._listener = listener;
      this.on(method, onError);
    } else if (method === 'open') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onOpen._listener = listener;
      this.on(method, onOpen);
    } else {
      this.on(method, listener);
    }
  }
};

module.exports = WebSocket;
module.exports.buildHostHeader = buildHostHeader

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function MessageEvent(dataArg, isBinary, target) {
  this.type = 'message';
  this.data = dataArg;
  this.target = target;
  this.binary = isBinary; // non-standard.
}

/**
 * W3C CloseEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function CloseEvent(code, reason, target) {
  this.type = 'close';
  this.wasClean = (typeof code === 'undefined' || code === 1000);
  this.code = code;
  this.reason = reason;
  this.target = target;
}

/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function OpenEvent(target) {
  this.type = 'open';
  this.target = target;
}

// Append port number to Host header, only if specified in the url
// and non-default
function buildHostHeader(isSecure, hostname, port) {
  var headerHost = hostname;
  if (hostname) {
    if ((isSecure && (port != 443)) || (!isSecure && (port != 80))){
      headerHost = headerHost + ':' + port;
    }
  }
  return headerHost;
}

/**
 * Entirely private apis,
 * which may or may not be bound to a sepcific WebSocket instance.
 */
function initAsServerClient(req, socket, upgradeHead, options) {
  options = new Options({
    protocolVersion: protocolVersion,
    protocol: null,
    extensions: {},
    maxPayload: 0
  }).merge(options);

  // expose state properties
  this.protocol = options.value.protocol;
  this.protocolVersion = options.value.protocolVersion;
  this.extensions = options.value.extensions;
  this.supports.binary = (this.protocolVersion !== 'hixie-76');
  this.upgradeReq = req;
  this.readyState = WebSocket.CONNECTING;
  this._isServer = true;
  this.maxPayload = options.value.maxPayload;
  // establish connection
  if (options.value.protocolVersion === 'hixie-76') {
    establishConnection.call(this, ReceiverHixie, SenderHixie, socket, upgradeHead);
  } else {
    establishConnection.call(this, Receiver, Sender, socket, upgradeHead);
  }
}

function initAsClient(address, protocols, options) {
  options = new Options({
    origin: null,
    protocolVersion: protocolVersion,
    host: null,
    headers: null,
    protocol: protocols.join(','),
    agent: null,

    // ssl-related options
    pfx: null,
    key: null,
    passphrase: null,
    cert: null,
    ca: null,
    ciphers: null,
    rejectUnauthorized: null,
    perMessageDeflate: true,
    localAddress: null
  }).merge(options);

  if (options.value.protocolVersion !== 8 && options.value.protocolVersion !== 13) {
    throw new Error('unsupported protocol version');
  }

  // verify URL and establish http class
  var serverUrl = url.parse(address);
  var isUnixSocket = serverUrl.protocol === 'ws+unix:';
  if (!serverUrl.host && !isUnixSocket) throw new Error('invalid url');
  var isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
  var httpObj = isSecure ? https : http;
  var port = serverUrl.port || (isSecure ? 443 : 80);
  var auth = serverUrl.auth;

  // prepare extensions
  var extensionsOffer = {};
  var perMessageDeflate;
  if (options.value.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(typeof options.value.perMessageDeflate !== true ? options.value.perMessageDeflate : {}, false);
    extensionsOffer[PerMessageDeflate.extensionName] = perMessageDeflate.offer();
  }

  // expose state properties
  this._isServer = false;
  this.url = address;
  this.protocolVersion = options.value.protocolVersion;
  this.supports.binary = (this.protocolVersion !== 'hixie-76');

  // begin handshake
  var key = new Buffer(options.value.protocolVersion + '-' + Date.now()).toString('base64');
  var shasum = crypto.createHash('sha1');
  shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  var expectedServerKey = shasum.digest('base64');

  var agent = options.value.agent;

  var headerHost = buildHostHeader(isSecure, serverUrl.hostname, port)

  var requestOptions = {
    port: port,
    host: serverUrl.hostname,
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'Host': headerHost,
      'Sec-WebSocket-Version': options.value.protocolVersion,
      'Sec-WebSocket-Key': key
    }
  };

  // If we have basic auth.
  if (auth) {
    requestOptions.headers.Authorization = 'Basic ' + new Buffer(auth).toString('base64');
  }

  if (options.value.protocol) {
    requestOptions.headers['Sec-WebSocket-Protocol'] = options.value.protocol;
  }

  if (options.value.host) {
    requestOptions.headers.Host = options.value.host;
  }

  if (options.value.headers) {
    for (var header in options.value.headers) {
       if (options.value.headers.hasOwnProperty(header)) {
        requestOptions.headers[header] = options.value.headers[header];
       }
    }
  }

  if (Object.keys(extensionsOffer).length) {
    requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format(extensionsOffer);
  }

  if (options.isDefinedAndNonNull('pfx')
   || options.isDefinedAndNonNull('key')
   || options.isDefinedAndNonNull('passphrase')
   || options.isDefinedAndNonNull('cert')
   || options.isDefinedAndNonNull('ca')
   || options.isDefinedAndNonNull('ciphers')
   || options.isDefinedAndNonNull('rejectUnauthorized')) {

    if (options.isDefinedAndNonNull('pfx')) requestOptions.pfx = options.value.pfx;
    if (options.isDefinedAndNonNull('key')) requestOptions.key = options.value.key;
    if (options.isDefinedAndNonNull('passphrase')) requestOptions.passphrase = options.value.passphrase;
    if (options.isDefinedAndNonNull('cert')) requestOptions.cert = options.value.cert;
    if (options.isDefinedAndNonNull('ca')) requestOptions.ca = options.value.ca;
    if (options.isDefinedAndNonNull('ciphers')) requestOptions.ciphers = options.value.ciphers;
    if (options.isDefinedAndNonNull('rejectUnauthorized')) requestOptions.rejectUnauthorized = options.value.rejectUnauthorized;

    if (!agent) {
        // global agent ignores client side certificates
        agent = new httpObj.Agent(requestOptions);
    }
  }

  requestOptions.path = serverUrl.path || '/';

  if (agent) {
    requestOptions.agent = agent;
  }

  if (isUnixSocket) {
    requestOptions.socketPath = serverUrl.pathname;
  }

  if (options.value.localAddress) {
    requestOptions.localAddress = options.value.localAddress;
  }

  if (options.value.origin) {
    if (options.value.protocolVersion < 13) requestOptions.headers['Sec-WebSocket-Origin'] = options.value.origin;
    else requestOptions.headers.Origin = options.value.origin;
  }

  var self = this;
  var req = httpObj.request(requestOptions);

  req.on('error', function onerror(error) {
    self.emit('error', error);
    cleanupWebsocketResources.call(self, error);
  });

  req.once('response', function response(res) {
    var error;

    if (!self.emit('unexpected-response', req, res)) {
      error = new Error('unexpected server response (' + res.statusCode + ')');
      req.abort();
      self.emit('error', error);
    }

    cleanupWebsocketResources.call(self, error);
  });

  req.once('upgrade', function upgrade(res, socket, upgradeHead) {
    if (self.readyState === WebSocket.CLOSED) {
      // client closed before server accepted connection
      self.emit('close');
      self.removeAllListeners();
      socket.end();
      return;
    }

    var serverKey = res.headers['sec-websocket-accept'];
    if (typeof serverKey === 'undefined' || serverKey !== expectedServerKey) {
      self.emit('error', 'invalid server key');
      self.removeAllListeners();
      socket.end();
      return;
    }

    var serverProt = res.headers['sec-websocket-protocol'];
    var protList = (options.value.protocol || "").split(/, */);
    var protError = null;

    if (!options.value.protocol && serverProt) {
      protError = 'server sent a subprotocol even though none requested';
    } else if (options.value.protocol && !serverProt) {
      protError = 'server sent no subprotocol even though requested';
    } else if (serverProt && protList.indexOf(serverProt) === -1) {
      protError = 'server responded with an invalid protocol';
    }

    if (protError) {
      self.emit('error', protError);
      self.removeAllListeners();
      socket.end();
      return;
    } else if (serverProt) {
      self.protocol = serverProt;
    }

    var serverExtensions = Extensions.parse(res.headers['sec-websocket-extensions']);
    if (perMessageDeflate && serverExtensions[PerMessageDeflate.extensionName]) {
      try {
        perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        self.emit('error', 'invalid extension parameter');
        self.removeAllListeners();
        socket.end();
        return;
      }
      self.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
    }

    establishConnection.call(self, Receiver, Sender, socket, upgradeHead);

    // perform cleanup on http resources
    req.removeAllListeners();
    req = null;
    agent = null;
  });

  req.end();
  this.readyState = WebSocket.CONNECTING;
}

function establishConnection(ReceiverClass, SenderClass, socket, upgradeHead) {
  var ultron = this._ultron = new Ultron(socket)
    , called = false
    , self = this;

  socket.setTimeout(0);
  socket.setNoDelay(true);

  this._receiver = new ReceiverClass(this.extensions,this.maxPayload);
  this._socket = socket;

  // socket cleanup handlers
  ultron.on('end', cleanupWebsocketResources.bind(this));
  ultron.on('close', cleanupWebsocketResources.bind(this));
  ultron.on('error', cleanupWebsocketResources.bind(this));

  // ensure that the upgradeHead is added to the receiver
  function firstHandler(data) {
    if (called || self.readyState === WebSocket.CLOSED) return;

    called = true;
    socket.removeListener('data', firstHandler);
    ultron.on('data', realHandler);

    if (upgradeHead && upgradeHead.length > 0) {
      realHandler(upgradeHead);
      upgradeHead = null;
    }

    if (data) realHandler(data);
  }

  // subsequent packets are pushed straight to the receiver
  function realHandler(data) {
    self.bytesReceived += data.length;
    self._receiver.add(data);
  }

  ultron.on('data', firstHandler);

  // if data was passed along with the http upgrade,
  // this will schedule a push of that on to the receiver.
  // this has to be done on next tick, since the caller
  // hasn't had a chance to set event handlers on this client
  // object yet.
  process.nextTick(firstHandler);

  // receiver event handlers
  self._receiver.ontext = function ontext(data, flags) {
    flags = flags || {};

    self.emit('message', data, flags);
  };

  self._receiver.onbinary = function onbinary(data, flags) {
    flags = flags || {};

    flags.binary = true;
    self.emit('message', data, flags);
  };

  self._receiver.onping = function onping(data, flags) {
    flags = flags || {};

    self.pong(data, {
      mask: !self._isServer,
      binary: flags.binary === true
    }, true);

    self.emit('ping', data, flags);
  };

  self._receiver.onpong = function onpong(data, flags) {
    self.emit('pong', data, flags || {});
  };

  self._receiver.onclose = function onclose(code, data, flags) {
    flags = flags || {};

    self._closeReceived = true;
    self.close(code, data);
  };

  self._receiver.onerror = function onerror(reason, errorCode) {
    // close the connection when the receiver reports a HyBi error code
    self.close(typeof errorCode !== 'undefined' ? errorCode : 1002, '');
    self.emit('error', (reason instanceof Error) ? reason : (new Error(reason)));
  };

  // finalize the client
  this._sender = new SenderClass(socket, this.extensions);
  this._sender.on('error', function onerror(error) {
    self.close(1002, '');
    self.emit('error', error);
  });

  this.readyState = WebSocket.OPEN;
  this.emit('open');
}

function startQueue(instance) {
  instance._queue = instance._queue || [];
}

function executeQueueSends(instance) {
  var queue = instance._queue;
  if (typeof queue === 'undefined') return;

  delete instance._queue;
  for (var i = 0, l = queue.length; i < l; ++i) {
    queue[i]();
  }
}

function sendStream(instance, stream, options, cb) {
  stream.on('data', function incoming(data) {
    if (instance.readyState !== WebSocket.OPEN) {
      if (typeof cb === 'function') cb(new Error('not opened'));
      else {
        delete instance._queue;
        instance.emit('error', new Error('not opened'));
      }
      return;
    }

    options.fin = false;
    instance._sender.send(data, options);
  });

  stream.on('end', function end() {
    if (instance.readyState !== WebSocket.OPEN) {
      if (typeof cb === 'function') cb(new Error('not opened'));
      else {
        delete instance._queue;
        instance.emit('error', new Error('not opened'));
      }
      return;
    }

    options.fin = true;
    instance._sender.send(null, options);

    if (typeof cb === 'function') cb(null);
  });
}

function cleanupWebsocketResources(error) {
  if (this.readyState === WebSocket.CLOSED) return;

  this.readyState = WebSocket.CLOSED;

  clearTimeout(this._closeTimer);
  this._closeTimer = null;

  // If the connection was closed abnormally (with an error), or if
  // the close control frame was not received then the close code
  // must default to 1006.
  if (error || !this._closeReceived) {
    this._closeCode = 1006;
  }
  this.emit('close', this._closeCode || 1000, this._closeMessage || '');

  if (this._socket) {
    if (this._ultron) this._ultron.destroy();
    this._socket.on('error', function onerror() {
      try { this.destroy(); }
      catch (e) {}
    });

    try {
      if (!error) this._socket.end();
      else this._socket.destroy();
    } catch (e) { /* Ignore termination errors */ }

    this._socket = null;
    this._ultron = null;
  }

  if (this._sender) {
    this._sender.removeAllListeners();
    this._sender = null;
  }

  if (this._receiver) {
    this._receiver.cleanup();
    this._receiver = null;
  }

  if (this.extensions[PerMessageDeflate.extensionName]) {
    this.extensions[PerMessageDeflate.extensionName].cleanup();
  }

  this.extensions = null;

  this.removeAllListeners();
  this.on('error', function onerror() {}); // catch all errors after this
  delete this._queue;
}

},{"./Extensions":13,"./PerMessageDeflate":14,"./Receiver":16,"./Receiver.hixie":15,"./Sender":18,"./Sender.hixie":17,"crypto":undefined,"events":undefined,"http":undefined,"https":undefined,"options":4,"stream":undefined,"ultron":5,"url":undefined,"util":undefined}],22:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util')
  , events = require('events')
  , http = require('http')
  , crypto = require('crypto')
  , Options = require('options')
  , WebSocket = require('./WebSocket')
  , Extensions = require('./Extensions')
  , PerMessageDeflate = require('./PerMessageDeflate')
  , tls = require('tls')
  , url = require('url');

/**
 * WebSocket Server implementation
 */

function WebSocketServer(options, callback) {
  if (this instanceof WebSocketServer === false) {
    return new WebSocketServer(options, callback);
  }

  events.EventEmitter.call(this);

  options = new Options({
    host: '0.0.0.0',
    port: null,
    server: null,
    verifyClient: null,
    handleProtocols: null,
    path: null,
    noServer: false,
    disableHixie: false,
    clientTracking: true,
    perMessageDeflate: true,
    maxPayload: 100 * 1024 * 1024
  }).merge(options);

  if (!options.isDefinedAndNonNull('port') && !options.isDefinedAndNonNull('server') && !options.value.noServer) {
    throw new TypeError('`port` or a `server` must be provided');
  }

  var self = this;

  if (options.isDefinedAndNonNull('port')) {
    this._server = http.createServer(function (req, res) {
      var body = http.STATUS_CODES[426];
      res.writeHead(426, {
        'Content-Length': body.length,
        'Content-Type': 'text/plain'
      });
      res.end(body);
    });
    this._server.allowHalfOpen = false;
    this._server.listen(options.value.port, options.value.host, callback);
    this._closeServer = function() { if (self._server) self._server.close(); };
  }
  else if (options.value.server) {
    this._server = options.value.server;
    if (options.value.path) {
      // take note of the path, to avoid collisions when multiple websocket servers are
      // listening on the same http server
      if (this._server._webSocketPaths && options.value.server._webSocketPaths[options.value.path]) {
        throw new Error('two instances of WebSocketServer cannot listen on the same http server path');
      }
      if (typeof this._server._webSocketPaths !== 'object') {
        this._server._webSocketPaths = {};
      }
      this._server._webSocketPaths[options.value.path] = 1;
    }
  }
  if (this._server) {
    this._onceServerListening = function() { self.emit('listening'); };
    this._server.once('listening', this._onceServerListening);
  }

  if (typeof this._server != 'undefined') {
    this._onServerError = function(error) { self.emit('error', error) };
    this._server.on('error', this._onServerError);
    this._onServerUpgrade = function(req, socket, upgradeHead) {
      //copy upgradeHead to avoid retention of large slab buffers used in node core
      var head = new Buffer(upgradeHead.length);
      upgradeHead.copy(head);

      self.handleUpgrade(req, socket, head, function(client) {
        self.emit('connection'+req.url, client);
        self.emit('connection', client);
      });
    };
    this._server.on('upgrade', this._onServerUpgrade);
  }

  this.options = options.value;
  this.path = options.value.path;
  this.clients = [];
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(WebSocketServer, events.EventEmitter);

/**
 * Immediately shuts down the connection.
 *
 * @api public
 */

WebSocketServer.prototype.close = function(callback) {
  // terminate all associated clients
  var error = null;
  try {
    for (var i = 0, l = this.clients.length; i < l; ++i) {
      this.clients[i].terminate();
    }
  }
  catch (e) {
    error = e;
  }

  // remove path descriptor, if any
  if (this.path && this._server._webSocketPaths) {
    delete this._server._webSocketPaths[this.path];
    if (Object.keys(this._server._webSocketPaths).length == 0) {
      delete this._server._webSocketPaths;
    }
  }

  // close the http server if it was internally created
  try {
    if (typeof this._closeServer !== 'undefined') {
      this._closeServer();
    }
  }
  finally {
    if (this._server) {
      this._server.removeListener('listening', this._onceServerListening);
      this._server.removeListener('error', this._onServerError);
      this._server.removeListener('upgrade', this._onServerUpgrade);
    }
    delete this._server;
  }
  if(callback)
    callback(error);
  else if(error)
    throw error;
}

/**
 * Handle a HTTP Upgrade request.
 *
 * @api public
 */

WebSocketServer.prototype.handleUpgrade = function(req, socket, upgradeHead, cb) {
  // check for wrong path
  if (this.options.path) {
    var u = url.parse(req.url);
    if (u && u.pathname !== this.options.path) return;
  }

  if (typeof req.headers.upgrade === 'undefined' || req.headers.upgrade.toLowerCase() !== 'websocket') {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  if (req.headers['sec-websocket-key1']) handleHixieUpgrade.apply(this, arguments);
  else handleHybiUpgrade.apply(this, arguments);
}

module.exports = WebSocketServer;

/**
 * Entirely private apis,
 * which may or may not be bound to a sepcific WebSocket instance.
 */

function handleHybiUpgrade(req, socket, upgradeHead, cb) {
  // handle premature socket errors
  var errorHandler = function() {
    try { socket.destroy(); } catch (e) {}
  }
  socket.on('error', errorHandler);

  // verify key presence
  if (!req.headers['sec-websocket-key']) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  // verify version
  var version = parseInt(req.headers['sec-websocket-version']);
  if ([8, 13].indexOf(version) === -1) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  // verify protocol
  var protocols = req.headers['sec-websocket-protocol'];

  // verify client
  var origin = version < 13 ?
    req.headers['sec-websocket-origin'] :
    req.headers['origin'];

  // handle extensions offer
  var extensionsOffer = Extensions.parse(req.headers['sec-websocket-extensions']);

  // handler to call when the connection sequence completes
  var self = this;
  var completeHybiUpgrade2 = function(protocol) {

    // calc key
    var key = req.headers['sec-websocket-key'];
    var shasum = crypto.createHash('sha1');
    shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    key = shasum.digest('base64');

    var headers = [
        'HTTP/1.1 101 Switching Protocols'
      , 'Upgrade: websocket'
      , 'Connection: Upgrade'
      , 'Sec-WebSocket-Accept: ' + key
    ];

    if (typeof protocol != 'undefined') {
      headers.push('Sec-WebSocket-Protocol: ' + protocol);
    }

    var extensions = {};
    try {
      extensions = acceptExtensions.call(self, extensionsOffer);
    } catch (err) {
      abortConnection(socket, 400, 'Bad Request');
      return;
    }

    if (Object.keys(extensions).length) {
      var serverExtensions = {};
      Object.keys(extensions).forEach(function(token) {
        serverExtensions[token] = [extensions[token].params]
      });
      headers.push('Sec-WebSocket-Extensions: ' + Extensions.format(serverExtensions));
    }

    // allows external modification/inspection of handshake headers
    self.emit('headers', headers);

    socket.setTimeout(0);
    socket.setNoDelay(true);
    try {
      socket.write(headers.concat('', '').join('\r\n'));
    }
    catch (e) {
      // if the upgrade write fails, shut the connection down hard
      try { socket.destroy(); } catch (e) {}
      return;
    }

    var client = new WebSocket([req, socket, upgradeHead], {
      protocolVersion: version,
      protocol: protocol,
      extensions: extensions,
      maxPayload: self.options.maxPayload
    });

    if (self.options.clientTracking) {
      self.clients.push(client);
      client.on('close', function() {
        var index = self.clients.indexOf(client);
        if (index != -1) {
          self.clients.splice(index, 1);
        }
      });
    }

    // signal upgrade complete
    socket.removeListener('error', errorHandler);
    cb(client);
  }

  // optionally call external protocol selection handler before
  // calling completeHybiUpgrade2
  var completeHybiUpgrade1 = function() {
    // choose from the sub-protocols
    if (typeof self.options.handleProtocols == 'function') {
        var protList = (protocols || "").split(/, */);
        var callbackCalled = false;
        var res = self.options.handleProtocols(protList, function(result, protocol) {
          callbackCalled = true;
          if (!result) abortConnection(socket, 401, 'Unauthorized');
          else completeHybiUpgrade2(protocol);
        });
        if (!callbackCalled) {
            // the handleProtocols handler never called our callback
            abortConnection(socket, 501, 'Could not process protocols');
        }
        return;
    } else {
        if (typeof protocols !== 'undefined') {
            completeHybiUpgrade2(protocols.split(/, */)[0]);
        }
        else {
            completeHybiUpgrade2();
        }
    }
  }

  // optionally call external client verification handler
  if (typeof this.options.verifyClient == 'function') {
    var info = {
      origin: origin,
      secure: typeof req.connection.authorized !== 'undefined' || typeof req.connection.encrypted !== 'undefined',
      req: req
    };
    if (this.options.verifyClient.length == 2) {
      this.options.verifyClient(info, function(result, code, name) {
        if (typeof code === 'undefined') code = 401;
        if (typeof name === 'undefined') name = http.STATUS_CODES[code];

        if (!result) abortConnection(socket, code, name);
        else completeHybiUpgrade1();
      });
      return;
    }
    else if (!this.options.verifyClient(info)) {
      abortConnection(socket, 401, 'Unauthorized');
      return;
    }
  }

  completeHybiUpgrade1();
}

function handleHixieUpgrade(req, socket, upgradeHead, cb) {
  // handle premature socket errors
  var errorHandler = function() {
    try { socket.destroy(); } catch (e) {}
  }
  socket.on('error', errorHandler);

  // bail if options prevent hixie
  if (this.options.disableHixie) {
    abortConnection(socket, 401, 'Hixie support disabled');
    return;
  }

  // verify key presence
  if (!req.headers['sec-websocket-key2']) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  var origin = req.headers['origin']
    , self = this;

  // setup handshake completion to run after client has been verified
  var onClientVerified = function() {
    var wshost;
    if (!req.headers['x-forwarded-host'])
        wshost = req.headers.host;
    else
        wshost = req.headers['x-forwarded-host'];
    var location = ((req.headers['x-forwarded-proto'] === 'https' || socket.encrypted) ? 'wss' : 'ws') + '://' + wshost + req.url
      , protocol = req.headers['sec-websocket-protocol'];

    // build the response header and return a Buffer
    var buildResponseHeader = function() {
      var headers = [
          'HTTP/1.1 101 Switching Protocols'
        , 'Upgrade: WebSocket'
        , 'Connection: Upgrade'
        , 'Sec-WebSocket-Location: ' + location
      ];
      if (typeof protocol != 'undefined') headers.push('Sec-WebSocket-Protocol: ' + protocol);
      if (typeof origin != 'undefined') headers.push('Sec-WebSocket-Origin: ' + origin);

      return new Buffer(headers.concat('', '').join('\r\n'));
    };

    // send handshake response before receiving the nonce
    var handshakeResponse = function() {

      socket.setTimeout(0);
      socket.setNoDelay(true);

      var headerBuffer = buildResponseHeader();

      try {
        socket.write(headerBuffer, 'binary', function(err) {
          // remove listener if there was an error
          if (err) socket.removeListener('data', handler);
          return;
        });
      } catch (e) {
        try { socket.destroy(); } catch (e) {}
        return;
      };
    };

    // handshake completion code to run once nonce has been successfully retrieved
    var completeHandshake = function(nonce, rest, headerBuffer) {
      // calculate key
      var k1 = req.headers['sec-websocket-key1']
        , k2 = req.headers['sec-websocket-key2']
        , md5 = crypto.createHash('md5');

      [k1, k2].forEach(function (k) {
        var n = parseInt(k.replace(/[^\d]/g, ''))
          , spaces = k.replace(/[^ ]/g, '').length;
        if (spaces === 0 || n % spaces !== 0){
          abortConnection(socket, 400, 'Bad Request');
          return;
        }
        n /= spaces;
        md5.update(String.fromCharCode(
          n >> 24 & 0xFF,
          n >> 16 & 0xFF,
          n >> 8  & 0xFF,
          n       & 0xFF));
      });
      md5.update(nonce.toString('binary'));

      socket.setTimeout(0);
      socket.setNoDelay(true);

      try {
        var hashBuffer = new Buffer(md5.digest('binary'), 'binary');
        var handshakeBuffer = new Buffer(headerBuffer.length + hashBuffer.length);
        headerBuffer.copy(handshakeBuffer, 0);
        hashBuffer.copy(handshakeBuffer, headerBuffer.length);

        // do a single write, which - upon success - causes a new client websocket to be setup
        socket.write(handshakeBuffer, 'binary', function(err) {
          if (err) return; // do not create client if an error happens
          var client = new WebSocket([req, socket, rest], {
            protocolVersion: 'hixie-76',
            protocol: protocol
          });
          if (self.options.clientTracking) {
            self.clients.push(client);
            client.on('close', function() {
              var index = self.clients.indexOf(client);
              if (index != -1) {
                self.clients.splice(index, 1);
              }
            });
          }

          // signal upgrade complete
          socket.removeListener('error', errorHandler);
          cb(client);
        });
      }
      catch (e) {
        try { socket.destroy(); } catch (e) {}
        return;
      }
    }

    // retrieve nonce
    var nonceLength = 8;
    if (upgradeHead && upgradeHead.length >= nonceLength) {
      var nonce = upgradeHead.slice(0, nonceLength);
      var rest = upgradeHead.length > nonceLength ? upgradeHead.slice(nonceLength) : null;
      completeHandshake.call(self, nonce, rest, buildResponseHeader());
    }
    else {
      // nonce not present in upgradeHead
      var nonce = new Buffer(nonceLength);
      upgradeHead.copy(nonce, 0);
      var received = upgradeHead.length;
      var rest = null;
      var handler = function (data) {
        var toRead = Math.min(data.length, nonceLength - received);
        if (toRead === 0) return;
        data.copy(nonce, received, 0, toRead);
        received += toRead;
        if (received == nonceLength) {
          socket.removeListener('data', handler);
          if (toRead < data.length) rest = data.slice(toRead);

          // complete the handshake but send empty buffer for headers since they have already been sent
          completeHandshake.call(self, nonce, rest, new Buffer(0));
        }
      }

      // handle additional data as we receive it
      socket.on('data', handler);

      // send header response before we have the nonce to fix haproxy buffering
      handshakeResponse();
    }
  }

  // verify client
  if (typeof this.options.verifyClient == 'function') {
    var info = {
      origin: origin,
      secure: typeof req.connection.authorized !== 'undefined' || typeof req.connection.encrypted !== 'undefined',
      req: req
    };
    if (this.options.verifyClient.length == 2) {
      var self = this;
      this.options.verifyClient(info, function(result, code, name) {
        if (typeof code === 'undefined') code = 401;
        if (typeof name === 'undefined') name = http.STATUS_CODES[code];

        if (!result) abortConnection(socket, code, name);
        else onClientVerified.apply(self);
      });
      return;
    }
    else if (!this.options.verifyClient(info)) {
      abortConnection(socket, 401, 'Unauthorized');
      return;
    }
  }

  // no client verification required
  onClientVerified();
}

function acceptExtensions(offer) {
  var extensions = {};
  var options = this.options.perMessageDeflate;
  var maxPayload = this.options.maxPayload;
  if (options && offer[PerMessageDeflate.extensionName]) {
    var perMessageDeflate = new PerMessageDeflate(options !== true ? options : {}, true, maxPayload);
    perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]);
    extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
  }
  return extensions;
}

function abortConnection(socket, code, name) {
  try {
    var response = [
      'HTTP/1.1 ' + code + ' ' + name,
      'Content-type: text/html'
    ];
    socket.write(response.concat('', '').join('\r\n'));
  }
  catch (e) { /* ignore errors - we've aborted this connection */ }
  finally {
    // ensure that an early aborted connection is shut down completely
    try { socket.destroy(); } catch (e) {}
  }
}

},{"./Extensions":13,"./PerMessageDeflate":14,"./WebSocket":21,"crypto":undefined,"events":undefined,"http":undefined,"options":4,"tls":undefined,"url":undefined,"util":undefined}],23:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _timer = require("../../timing/timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _stream = require("../../updates/stream.js");

var _stream2 = _interopRequireDefault(_stream);

var _iteration = require("../../updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerClient = function (_Client) {
    _inherits(ServerClient, _Client);

    function ServerClient(ws, id, isHost) {
        _classCallCheck(this, ServerClient);

        var _this = _possibleConstructorReturn(this, (ServerClient.__proto__ || Object.getPrototypeOf(ServerClient)).call(this, id, isHost));

        _this.ws = ws;
        return _this;
    }

    _createClass(ServerClient, [{
        key: "send",
        value: function send(data) {
            return this.ws.send(JSON.stringify(data));
        }
    }]);

    return ServerClient;
}(_stream.Client);

var Packet = function (_UpdateStream) {
    _inherits(Packet, _UpdateStream);

    function Packet(from, string) {
        _classCallCheck(this, Packet);

        var _this2 = _possibleConstructorReturn(this, (Packet.__proto__ || Object.getPrototypeOf(Packet)).call(this));

        _this2.from = from;
        _this2.string = string;
        return _this2;
    }

    _createClass(Packet, [{
        key: "decode",
        value: function decode() {
            this.updates = JSON.parse(this.string);
        }
    }, {
        key: "json",
        value: function json() {
            return { from: this.from, data: this.string };
        }
    }, {
        key: "iterator",
        value: function iterator() {
            return new _iteration2.default(this.updates, true);
        }
    }]);

    return Packet;
}(_stream2.default);

function encode(from, object) {
    return new Packet(from, JSON.stringify(object));
}

var ServerClientList = function (_ClientList) {
    _inherits(ServerClientList, _ClientList);

    function ServerClientList() {
        _classCallCheck(this, ServerClientList);

        return _possibleConstructorReturn(this, (ServerClientList.__proto__ || Object.getPrototypeOf(ServerClientList)).call(this));
    }

    _createClass(ServerClientList, [{
        key: "alloc",
        value: function alloc(ws) {
            return this.push(new ServerClient(ws));
        }
    }]);

    return ServerClientList;
}(_stream.ClientList);

var Server = function () {
    function Server(wss) {
        var _this4 = this;

        _classCallCheck(this, Server);

        this.wss = wss;
        this.clients = new ServerClientList();

        this.local = this.clients.push(new _stream.Client());

        this.packets = [];
        this.wss.on('connection', function (ws) {
            var cl = _this4.clients.alloc(ws);

            if (_this4.clients.length() == 2) {
                _this4.clients.setHost(cl.id());
            }

            ws.id = cl.id();
            _this4.packets.push(encode(_this4.local.id(), { name: "CONNECTED", id: cl.id(), isHost: cl.host(), clients: _this4.clients.export() }));

            ws.on('message', function (message) {
                _this4.packets.push(new Packet(cl.id(), message));
            });

            ws.on('close', function (ws2) {
                _this4.clients.remove(cl.id());
            });
        });
    }

    _createClass(Server, [{
        key: "update",
        value: function update() {
            var hostClient = this.clients.host();

            var it = this.clients.iterator();
            var c = 0;
            while (it.hasNext()) {
                var client = it.next();
                if (client != this.local) {
                    var clUpdates = [];
                    for (var i = 0; i < this.packets.length; i++) {
                        var p = this.packets[i];

                        if (p.from != client.id()) {
                            clUpdates.push(p.json());
                        }
                    }

                    if (clUpdates.length > 0) {
                        console.log(client.id());
                        client.send(clUpdates);
                    }
                }
            }

            this.packets = [];
        }
    }, {
        key: "broadcastAllExcept",
        value: function broadcastAllExcept(data, except) {
            var it = this.clients.iterator();
            while (it.hasNext()) {
                var cl = it.remove();
                if (cl != this.local && cl != except) {
                    cl.send(data);
                }
            }
        }
    }]);

    return Server;
}();

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

var SERVER_INDEX = 0;
var MAX_CLIENTS = 64;
var SEND_RATE = 1000 / 60;

function run() {
    var timer = new _timer2.default();
    var server = new Server(wss);

    setInterval(function () {
        timer.update(function () {
            server.update();
        });
    }, SEND_RATE);
}

run();

console.log("Running server...");

},{"../../timing/timer.js":25,"../../updates/iteration.js":26,"../../updates/stream.js":27,"ws":8}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function currentTime() {
	return Date.now();
}

var Counter = function () {
	function Counter() {
		_classCallCheck(this, Counter);

		this._oldTime = 0;
		this.time = 0;
		this.tick = 0;
		this.deltaTime = 0;
	}

	_createClass(Counter, [{
		key: "update",
		value: function update() {
			this.tick++;

			if (this.tick == 1) {
				this._oldTime = currentTime();
			}

			var curTime = currentTime();
			this.deltaTime = curTime - this._oldTime;
			this._oldTime = curTime;

			this.time += this.deltaTime;
		}
	}]);

	return Counter;
}();

exports.default = Counter;

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _counter = require("./counter.js");

var _counter2 = _interopRequireDefault(_counter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Timer = function (_Counter) {
	_inherits(Timer, _Counter);

	function Timer() {
		_classCallCheck(this, Timer);

		var _this = _possibleConstructorReturn(this, (Timer.__proto__ || Object.getPrototypeOf(Timer)).call(this));

		_this.delayCounter = new _counter2.default();
		_this.delays = [];

		_this.intervals = [];

		_this.parent = null;
		_this.tetherables = [];

		_this.delayed = false;
		_this.paused = false;
		return _this;
	}

	_createClass(Timer, [{
		key: "reset",
		value: function reset() {
			this.tick = 0;
			this.delays = [];
			this.intervals = [];
		}
	}, {
		key: "addDelay",
		value: function addDelay(delay) {
			delay.start(this.delayCounter);

			this.delays.push(delay);
		}
	}, {
		key: "addInterval",
		value: function addInterval(interval) {
			interval.reset(this);

			this.intervals.push(interval);
		}
	}, {
		key: "addTetherable",
		value: function addTetherable(child) {
			this.tetherables.push(child);
		}
	}, {
		key: "removeTetherable",
		value: function removeTetherable(child) {
			this.tetherables.splice(this.tetherables.indexOf(child), 1);
		}
	}, {
		key: "tether",
		value: function tether(parent) {
			this.parent = parent;
			this.parent.addTetherable(this);
		}
	}, {
		key: "untether",
		value: function untether() {
			this.parent = null;
			this.parent.removeTetherable(this);
		}
	}, {
		key: "setTick",
		value: function setTick(newTick) {
			this.tick = newTick;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.intervals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var interval = _step.value;

					interval.reset(this);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: "getTick",
		value: function getTick() {
			return this.tick;
		}
	}, {
		key: "update",
		value: function update(main) {
			if (!this.paused) {
				this.delayCounter.update(this);

				var delayed = false;
				var delays = this.delays;

				for (var i = 0; i < delays.length; i++) {
					var delay = delays[i];
					if (!delay.complete(this.delayCounter)) delayed = true;else if (delay.delete()) {
						delays.splice(i, 1);
					}
				}

				if (delayed) {
					return false;
				}

				if (!this.parent) {
					_get(Timer.prototype.__proto__ || Object.getPrototypeOf(Timer.prototype), "update", this).call(this);
				} else {
					this.tick = this.parent.tick;
					this.time = this.parent.time;
				}

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.tetherables[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var tetherable = _step2.value;

						tetherable.tick = this.tick;
						tetherable.time = this.time;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = this.intervals[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var interval = _step3.value;

						interval.update(this);
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				if (main) return main();
			}

			return false;
		}
	}], [{
		key: "currentTime",
		get: function get() {
			return Date.now();
		}
	}]);

	return Timer;
}(_counter2.default);

exports.default = Timer;

},{"./counter.js":24}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasicIterator = function () {
	function BasicIterator(data, copy) {
		_classCallCheck(this, BasicIterator);

		this.data = data;
		this.index = 0;
		//copy = copy || true;
		if (copy) this.data = [].concat(data);
	}

	_createClass(BasicIterator, [{
		key: "hasNext",
		value: function hasNext() {
			return this.index < this.data.length;
		}
	}, {
		key: "next",
		value: function next() {
			return this.data[this.index++];
		}
	}, {
		key: "remove",
		value: function remove() {
			this.index--;
			if (this.index <= 0) {
				this.index = 0;
				return this.data.shift();
			}
			return this.data.splice(this.index, 1);
		}
	}]);

	return BasicIterator;
}();

exports.default = BasicIterator;

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ClientList = exports.LocalClientUpdateStream = exports.ClientUpdateStream = exports.Client = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iteration = require("./iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UpdateStream = function () {
	function UpdateStream(updates) {
		_classCallCheck(this, UpdateStream);

		this.updates = updates || [];
	}

	_createClass(UpdateStream, [{
		key: "push",
		value: function push(update) {
			this.updates.push(update);
		}
	}, {
		key: "iterator",
		value: function iterator() {
			return new _iteration2.default(this.updates, false);
		}
	}]);

	return UpdateStream;
}();

exports.default = UpdateStream;

var Client = exports.Client = function () {
	function Client(id, isHost) {
		_classCallCheck(this, Client);

		this._id = id;
		this._isHost = isHost;
	}

	_createClass(Client, [{
		key: "host",
		value: function host(value) {
			if (typeof value === "undefined") {
				return this._isHost;
			}

			this._isHost = value;
			return this._isHost;
		}
	}, {
		key: "id",
		value: function id(value) {
			if (typeof value === "undefined") {
				return this._id;
			}

			this._id = value;
			return this._id;
		}
	}]);

	return Client;
}();

var ClientUpdateStream = exports.ClientUpdateStream = function (_UpdateStream) {
	_inherits(ClientUpdateStream, _UpdateStream);

	function ClientUpdateStream(id, isHost) {
		_classCallCheck(this, ClientUpdateStream);

		var _this = _possibleConstructorReturn(this, (ClientUpdateStream.__proto__ || Object.getPrototypeOf(ClientUpdateStream)).call(this));

		_this._id = id;
		_this._isHost = isHost;
		_this.cachedUpdates = [];
		return _this;
	}

	_createClass(ClientUpdateStream, [{
		key: "host",
		value: function host(value) {
			if (typeof value === "undefined") {
				return this._isHost;
			}

			this._isHost = value;
			return this._isHost;
		}
	}, {
		key: "id",
		value: function id(value) {
			if (typeof value === "undefined") {
				return this._id;
			}

			this._id = value;
			return this._id;
		}
	}, {
		key: "recv",
		value: function recv() {
			this.updates = this.updates.concat(this.cachedUpdates.splice(0));
		}
	}]);

	return ClientUpdateStream;
}(UpdateStream);

var LocalClientUpdateStream = exports.LocalClientUpdateStream = function (_ClientUpdateStream) {
	_inherits(LocalClientUpdateStream, _ClientUpdateStream);

	function LocalClientUpdateStream(connection, id, isHost) {
		_classCallCheck(this, LocalClientUpdateStream);

		var _this2 = _possibleConstructorReturn(this, (LocalClientUpdateStream.__proto__ || Object.getPrototypeOf(LocalClientUpdateStream)).call(this, id, isHost));

		_this2.connection = connection;
		_this2.localUpdates = [];
		return _this2;
	}

	_createClass(LocalClientUpdateStream, [{
		key: "push",
		value: function push(update) {
			_get(LocalClientUpdateStream.prototype.__proto__ || Object.getPrototypeOf(LocalClientUpdateStream.prototype), "push", this).call(this, update);

			this.localUpdates.push(update);
		}
	}, {
		key: "flush",
		value: function flush() {
			var updates = this.localUpdates;

			if (updates.length > 0) {
				this.connection.send(updates.splice(0));
			}
		}
	}]);

	return LocalClientUpdateStream;
}(ClientUpdateStream);

var ClientList = exports.ClientList = function () {
	function ClientList() {
		_classCallCheck(this, ClientList);

		this.hostId = -1;
		this.arr = [];
		this.arrIds = [];
	}

	_createClass(ClientList, [{
		key: "length",
		value: function length() {
			return this.arr.length;
		}
	}, {
		key: "has",
		value: function has(id) {
			return this.arrIds.indexOf(id) != -1;
		}
	}, {
		key: "get",
		value: function get(id) {
			return this.arr[this.arrIds.indexOf(id)];
		}
	}, {
		key: "push",
		value: function push(client) {
			var id = client.id();
			if (id && id != -1 && this.has(id)) return;

			if (!id || id == -1) id = this.arr.length;

			client.id(id);
			client.host(client.host() || false);

			if (client.host()) {
				this.hostId = id;
			}

			this.arr.push(client);
			this.arrIds.push(id);

			return client;
		}
	}, {
		key: "set",
		value: function set(client) {
			this.arr[this.arrIds.indexOf(client.id())] = client;
		}
	}, {
		key: "remove",
		value: function remove(id) {
			var i = this.arrIds.indexOf(id);
			if (i != -1) {
				this.arr.splice(id, 1);
				this.arrIds.splice(id, 1);
			}
		}
	}, {
		key: "setHost",
		value: function setHost(id) {
			if (this.has(id)) {
				if (this.hostId > -1) {
					this.get(this.hostId).host(false);
				}

				this.hostId = id;
				var stream = this.get(id);
				stream.host(true);
			}
		}
	}, {
		key: "host",
		value: function host() {
			return this.get(this.hostId);
		}
	}, {
		key: "export",
		value: function _export() {
			var clients = [];
			var it = this.iterator();
			while (it.hasNext()) {
				var cl = it.remove();
				clients.push({ id: cl.id(), isHost: cl.host() });
			}
			return clients;
		}
	}, {
		key: "iterator",
		value: function iterator() {
			return new _iteration2.default(this.arr, true);
		}
	}]);

	return ClientList;
}();

},{"./iteration.js":26}]},{},[23]);
