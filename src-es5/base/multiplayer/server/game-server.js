"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ws = require("ws");

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../../engine/updates/streamed/client-stream.js");

var _packet = require("./packet.js");

var _packet2 = _interopRequireDefault(_packet);

var _client2 = require("./client.js");

var _client3 = _interopRequireDefault(_client2);

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function encode(from, object) {
  return new _packet2.default(from, JSON.stringify(object));
}

class GameServer extends _multiplayer2.default {
  constructor(port) {
    super();
    this.wss = new _ws.Server({
      port
    });
    this.local = this.clients.push(new _clientStream.LocalClientUpdateStream());
    this.clients.setHost(this.local.id());
    this.packets = [];
    this.wss.on('connection', ws => {
      let cl = this.clients.push(new _client3.default(ws));
      let local = [];
      console.log("Added client " + cl.id());
      ws.id = cl.id();
      local.push({
        name: "CONNECTED",
        id: cl.id(),
        isHost: cl.host()
      });
      local.push({
        name: "CLIENTS_LIST",
        list: this.clients.export()
      });
      local.push({
        name: "SET_HOST",
        id: this.clients.hostId
      });
      cl.send([encode(this.local.id(), local).json()]);
      this.local.push({
        name: "CLIENT_ADDED",
        id: cl.id(),
        isHost: cl.host()
      });
      this.packets.push(encode(this.local.id(), [{
        name: "CLIENT_ADDED",
        id: cl.id(),
        isHost: cl.host()
      }]));
      ws.on('message', message => {
        cl.cache(JSON.parse(message));
        this.packets.push(new _packet2.default(cl.id(), message));
      });
      ws.on('close', ws2 => {
        //console.log("attempting to remove");
        this.packets.push(encode(this.local.id(), [{
          name: "CLIENT_REMOVED",
          id: cl.id()
        }]));
      });
    });
    this.emit("connected");
    this.connected = true;
  }

  getLocalClient() {
    return this.local;
  }

  getClients() {
    return this.clients;
  }

  update(frame) {
    this.recv();
    this.local.update(frame);
  }

  flush() {
    let hostClient = this.clients.host();
    let it = this.clients.iterator();
    let c = 0;
    let localUpdatePacket = encode(this.local.id(), this.local.toBeSent.splice(0)).json();

    while (it.hasNext()) {
      let client = it.next();

      if (client != this.local) {
        let clUpdates = [localUpdatePacket];

        for (let i = 0; i < this.packets.length; i++) {
          let p = this.packets[i];

          if (p.from != client.id()) {
            clUpdates.push(p.json());
          }
        }

        if (clUpdates.length > 0) {
          try {
            client.send(clUpdates);
          } catch (e) {
            this.clients.remove(client.id());
            console.log("Client error: " + e.message + " -> Removing client");
          }
        }
      }

      c++;
    }

    this.packets = [];
  }

}

exports.default = GameServer;