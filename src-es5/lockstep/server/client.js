"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _clientStream = require("../../base/updates/streamed/client-stream.js");

const OPEN = 1;

class ServerClient extends _clientStream.ClientUpdateStream {
  constructor(ws, id, isHost) {
    super(id, isHost);
    this.ws = ws;
  }

  get connected() {
    return this.ws.readyState == OPEN;
  }

  send(data) {
    return this.ws.send(JSON.stringify(data));
  }

}

exports.default = ServerClient;