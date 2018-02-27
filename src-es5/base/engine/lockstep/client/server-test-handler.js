"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lockstepClientInterface = require("../lockstep-client-interface.js");

var _lockstepClientInterface2 = _interopRequireDefault(_lockstepClientInterface);

var _client = require("../../../engine/updates/client.js");

var _clientStream = require("../../../engine/updates/streamed/client-stream.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ServerTestHandler extends _lockstepClientInterface2.default {
  constructor() {
    super();
    this.local = new _clientStream.LocalClientUpdateStream(null, 0, true);
    this.local.push({
      name: "INIT"
    }, false);
    this.clients.push(this.local);
    this.clients.setHost(0);
    this.connected = true;
    this.emit("connected", this.local);
  }

  getLocalClient() {
    return this.local;
  }

  getClients() {
    return this.clients;
  }

  flush() {}

  update(frame) {
    this.local.update(frame);
  }

}

exports.default = ServerTestHandler;