"use strict";

var _timer = require("./base/engine/timing/timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _stream = require("./base/engine/updates/stream.js");

var _stream2 = _interopRequireDefault(_stream);

var _iteration = require("./base/engine/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _renderer = require("./base/engine/rendering/renderer.js");

var _renderer2 = _interopRequireDefault(_renderer);

var _dominos = require("./dominos.js");

var _dominos2 = _interopRequireDefault(_dominos);

var _events = require("./base/shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _gameServer = require("./base/multiplayer/server/game-server.js");

var _gameServer2 = _interopRequireDefault(_gameServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVER_INDEX = 0;
var MAX_CLIENTS = 64;
var REFRESH_RATE = 1000 / 128;

function run() {
    var server = new _gameServer2.default(8080, MAX_CLIENTS);

    var config = { multiplayer: server,
        renderer: new _renderer2.default(),
        headless: true,
        server: true };

    var game = new _dominos2.default(config);

    setInterval(function () {
        game.update();
        //console.log(game.getDebugString());
    }, REFRESH_RATE);
}

run();

console.log("Running server...");