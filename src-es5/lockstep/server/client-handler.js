"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ws = require("ws");

var _events = require("../../base/shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../../base/updates/client.js");

var _clientStream = require("../../base/updates/streamed/client-stream.js");

var _packet = require("./packet.js");

var _packet2 = _interopRequireDefault(_packet);

var _client2 = require("./client.js");

var _client3 = _interopRequireDefault(_client2);

var _lockstepClientInterface = require("../lockstep-client-interface.js");

var _lockstepClientInterface2 = _interopRequireDefault(_lockstepClientInterface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function encode(server, from, object) {
  return new _packet2.default(from, JSON.stringify(object), server);
}

class GameServer extends _lockstepClientInterface2.default {
  constructor(port) {
    super();
    this.wss = new _ws.Server({
      port
    });
    this.local = this.clients.push(new _clientStream.LocalClientUpdateStream());
    this.clients.setHost(this.local.id());
    this.connections = [];
    this.packets = [];
    this.wss.on('connection', ws => {
      let cl = this.clients.push(new _client3.default(ws));
      ws.id = cl.id();
      this.connections.push(cl);
      ws.on('message', message => {
        cl.cache(JSON.parse(message));
        this.packets.push(new _packet2.default(cl.id(), message, false));
        this.emit("message", {
          client: cl,
          message: message
        });
      });
      ws.on('close', ws2 => {
        this.packets.push(encode(true, this.local.id(), [{
          name: "CLIENT_REMOVED",
          id: cl.id()
        }]));
        this.emit("disconnection", cl);
      });
    });
    this.emit("connected");
    this.connected = true;
  }

  getLocalClient() {
    return this.local;
  }

  update(frame) {
    this.recv();
    this.local.update(frame);

    while (this.connections.length > 0) {
      let conn = this.connections.shift();
      let initialUpdates = [];
      initialUpdates.push({
        name: "CONNECTED",
        id: conn.id(),
        isHost: conn.host()
      });
      initialUpdates.push({
        name: "CLIENTS_LIST",
        list: this.clients.export()
      });
      initialUpdates.push({
        name: "SET_HOST",
        id: this.clients.hostId
      });
      conn.send([encode(true, this.local.id(), initialUpdates).json()]);
      this.local.push({
        name: "CLIENT_ADDED",
        id: conn.id(),
        isHost: conn.host()
      });
      this.packets.push(encode(true, this.local.id(), [{
        name: "CLIENT_ADDED",
        id: conn.id(),
        isHost: conn.host()
      }]));
      this.emit("connection", conn);
      console.log("Added client " + conn.id());
    }
  }

  flush() {
    let hostClient = this.clients.host();
    let it = this.clients.iterator();
    let us = this.local.toBeSent.splice(0);
    let localUpdatePacket = encode(false, this.local.id(), us).json();

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
    }

    this.packets = [];
  }

}

exports.default = GameServer;