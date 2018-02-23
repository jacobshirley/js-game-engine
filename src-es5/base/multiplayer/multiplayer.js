"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../engine/updates/client.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Multiplayer extends _events2.default {
  constructor() {
    super();
    this.clients = new _client.ClientList();
    this.localUpdates = [];
    this.queueR = [];
  }

  push(update) {//this.localUpdates.push(update);
  }

  recv() {
    let clients = this.clients.iterator();

    while (clients.hasNext()) {
      clients.remove().recv();
    }
  }

  queueRemove(client) {
    this.queueR.push(client);
  }

  getLocalClient() {}

  getClients() {
    return this.clients;
  }

  flush() {}

  update() {}

}

exports.default = Multiplayer;