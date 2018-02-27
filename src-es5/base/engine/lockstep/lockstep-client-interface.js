"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../../engine/updates/client.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepClientInterface extends _events2.default {
  constructor() {
    super();
    this.clients = new _client.ClientList();
  }

  recv() {
    let clients = this.clients.iterator();

    while (clients.hasNext()) {
      clients.remove().recv();
    }
  }

  getLocalClient() {}

  getClients() {
    return this.clients;
  }

  flush() {}

  update() {}

}

exports.default = LockstepClientInterface;