"use strict";

var _jenga = require("./jenga.js");

var _jenga2 = _interopRequireDefault(_jenga);

var _lockstepEngine = require("./lockstep/lockstep-engine.js");

var _lockstepEngine2 = _interopRequireDefault(_lockstepEngine);

var _clientHandler = require("./lockstep/server/client-handler.js");

var _clientHandler2 = _interopRequireDefault(_clientHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FRAMES_PER_SECOND = 128;

function run() {
  let config = {
    clientInterface: new _clientHandler2.default(8080),
    headless: true,
    server: true,
    sendOnFrame: 1,
    port: 8080
  };
  let game = new _jenga2.default(config);
  let engine = new _lockstepEngine2.default(game, config);
  const REFRESH_RATE = 1000 / FRAMES_PER_SECOND;
  setInterval(() => {
    engine.update();
  }, REFRESH_RATE);
}

run();
console.log("Running server...");