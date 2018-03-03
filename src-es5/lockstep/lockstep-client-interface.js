"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../base/shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../base/updates/client.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepClientInterface extends _events2.default {
  constructor(clients) {
    super();
    this.clients = clients || new _client.ClientList();
  }

  recv() {
    let clients = this.clients.iterator();

    while (clients.hasNext()) {
      clients.remove().recv();
    }
  }

  clear() {
    for (let cl of this.clients.arr) {
      cl.clear();
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