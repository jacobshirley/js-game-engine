"use strict";

var _dominos = require("./dominos.js");

var _dominos2 = _interopRequireDefault(_dominos);

var _lockstepEngine = require("./lockstep/lockstep-engine.js");

var _lockstepEngine2 = _interopRequireDefault(_lockstepEngine);

var _clientHandler = require("./lockstep/server/client-handler.js");

var _clientHandler2 = _interopRequireDefault(_clientHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SERVER_INDEX = 0;
const MAX_CLIENTS = 64;
const REFRESH_RATE = 1000 / 128;

function run() {
  let config = {
    clientInterface: new _clientHandler2.default(8080, MAX_CLIENTS),
    headless: true,
    server: true,
    maxFPS: 60,
    sendOnFrame: 1,
    port: 8080
  };
  let game = new _dominos2.default(config);
  let engine = new _lockstepEngine2.default(game, config);
  setInterval(() => {
    engine.update();
  }, REFRESH_RATE);
}

run();
console.log("Running server...");