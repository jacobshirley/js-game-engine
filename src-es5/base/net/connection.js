"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
let SERVER_ID = 0;

class Connection extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }

  get isConnected() {
    return this.connected;
  }

  close() {}

  send(data) {}

}

exports.default = Connection;

class WebSocketConnection extends Connection {
  constructor(ip) {
    super();
    this.ip = ip;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.ip);

    this.ws.onopen = () => {
      console.log("Connected");
      this.connected = true;
      this.emit('connected');
    };

    this.ws.onclose = () => {
      console.log("Disconnected");
      this.connected = false;
      this.emit('disconnected');
    };

    this.ws.onerror = ev => {
      this.emit('error', ev);
    };

    this.ws.onmessage = ev => {
      this.emit('message', JSON.parse(ev.data));
    };
  }

  reset() {
    this.connected = false;
    this.ws.close();

    this.ws.onclose = () => {
      this.connect();
    };
  }

  close() {
    this.connected = false;
    this.ws.close();
  }

  send(data) {
    if (this.connected) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.log("not connected");
    }
  }

}

exports.WebSocketConnection = WebSocketConnection;

class TestConnection extends Connection {
  constructor(latency, packetLossChance) {
    super();
    this.latency = latency;
    this.packetLossChance = packetLossChance;
    this.connected = true;
    this.emit('connected');
    this.data = [];
    this.data.push({
      server: true,
      data: JSON.stringify([{
        name: "CONNECTED",
        id: 0,
        isHost: true
      }])
    });
    this.data.push({
      server: true,
      data: JSON.stringify([{
        name: "CLIENTS_LIST",
        list: [{
          id: 0,
          isHost: true
        }]
      }])
    });
    setInterval(() => {
      if (this.data.length > 0 && Math.random() > this.packetLossChance) {
        this.emit('message', this.data);
      }

      this.data = [];
    }, this.latency);
  }

  send(data) {//this.data = this.data.concat({from: 1, data: data});
  }

}

exports.TestConnection = TestConnection;