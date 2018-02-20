"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../../engine/updates/streamed/client-stream.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ServerTestConnection extends _multiplayer2.default {
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

exports.default = ServerTestConnection;