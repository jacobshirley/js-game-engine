"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _clientStream = require("../../engine/updates/streamed/client-stream.js");

class ServerClient extends _clientStream.ClientUpdateStream {
  constructor(ws, id, isHost) {
    super(id, isHost);
    this.ws = ws;
  }

  send(data) {
    return this.ws.send(JSON.stringify(data));
  }

}

exports.default = ServerClient;