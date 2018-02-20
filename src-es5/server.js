"use strict";

var _timer = require("./base/engine/timing/timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _renderer = require("./base/engine/world/rendering/renderer.js");

var _renderer2 = _interopRequireDefault(_renderer);

var _dominos = require("./dominos.js");

var _dominos2 = _interopRequireDefault(_dominos);

var _events = require("./base/shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _gameServer = require("./base/multiplayer/server/game-server.js");

var _gameServer2 = _interopRequireDefault(_gameServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SERVER_INDEX = 0;
const MAX_CLIENTS = 64;
const REFRESH_RATE = 1000 / 128;

function run() {
  let server = new _gameServer2.default(8080, MAX_CLIENTS);
  let config = {
    multiplayer: server,
    renderer: new _renderer2.default(),
    headless: true,
    server: true
  };
  let game = new _dominos2.default(config);
  setInterval(() => {
    game.update(); //console.log(game.getDebugString());
  }, REFRESH_RATE);
}

run();
console.log("Running server...");