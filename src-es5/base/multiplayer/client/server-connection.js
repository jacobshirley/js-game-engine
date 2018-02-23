"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../../engine/updates/streamed/client-stream.js");

var _iteration = require("../../engine/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ServerConnection extends _multiplayer2.default {
  constructor(connection, ...args) {
    super(...args);
    this.local = null;
    this.connection = connection;
    this.connected = false;
    this.queue = null;
    this.serverUpdates = [];
    this.connection.on('message', data => {
      for (let i = 0; i < data.length; i++) {
        let updates = data[i];
        let data2 = JSON.parse(updates.data);

        if (updates.server) {
          this.serverUpdates = this.serverUpdates.concat(data2);
        }

        let client = this.clients.get(updates.from);

        if (!client) {
          client = this.clients.push(new _clientStream.ClientUpdateStream(updates.from));
        }

        client.cache(data2);
      }
    });
  }

  getLocalClient() {
    return this.local;
  }

  getClients() {
    return this.clients;
  }

  flush() {
    this.local.flush();
  }

  update(frame) {
    this.recv();

    while (this.serverUpdates.length > 0) {
      this.process(this.serverUpdates.shift());
    }

    if (this.connected) this.local.update(frame);
  }

  clear() {
    for (let cl of this.clients.arr) {
      cl.clear();
    }
  }

  process(update) {
    if (update.name == "CONNECTED") {
      this.local = this.clients.push(new _clientStream.LocalClientUpdateStream(this.connection, update.id, update.isHost));
      this.local.push({
        name: "INIT"
      }, false);
      this.connected = true;
      this.emit("connected", this.local);
    } else if (update.name == "CLIENT_ADDED") {
      if (update.id != this.local.id()) {
        let nC = this.clients.push(new _clientStream.ClientUpdateStream(update.id, update.isHost));
        this.emit("client-added", nC);
      }
    } else if (update.name == "CLIENTS_LIST") {
      for (let cl of update.list) {
        if (cl.id != this.local.id) {
          let cl2 = null;

          if (!this.clients.has(cl.id)) {
            cl2 = this.clients.push(new _clientStream.ClientUpdateStream(cl.id, cl.isHost));
          } else {
            cl2 = this.clients.get(cl.id);
            cl2.host(cl.isHost);
          }

          this.emit("client-added", cl2);
        }
      }
    } else if (update.name == "CLIENT_REMOVED") {
      let id = update.id; //no need to remove client as there may still be queued updates

      this.emit("client-removed", id);
    } else if (update.name == "SET_HOST") {
      this.clients.setHost(update.id);
      this.emit("set-host", update.id);
    }
  }

  destory() {}

}

exports.default = ServerConnection;