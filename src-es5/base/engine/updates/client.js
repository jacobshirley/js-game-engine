"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientList = undefined;

var _iteration = require("./iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Client {
  constructor(id, isHost) {
    this._id = id;
    this._isHost = isHost;
  }

  host(value) {
    if (typeof value === "undefined") {
      return this._isHost;
    }

    this._isHost = value;
    return this._isHost;
  }

  id(value) {
    if (typeof value === "undefined") {
      return this._id;
    }

    this._id = value;
    return this._id;
  }

}

exports.default = Client;

class ClientList {
  constructor() {
    this.hostId = -1;
    this.arr = [];
    this.arrIds = [];
  }

  length() {
    return this.arr.length;
  }

  has(id) {
    return this.arrIds.indexOf(id) != -1;
  }

  get(id) {
    return this.arr[this.arrIds.indexOf(id)];
  }

  _newId() {
    for (let i = 0; i < this.length(); i++) {
      if (!this.has(i)) {
        return i;
      }
    }

    return this.arr.length;
  }

  push(client) {
    let id = client.id();
    let isSet = !(typeof id === 'undefined');

    if (!isSet || id == -1) {
      id = this._newId();
    }

    if (isSet && id != -1 && this.has(id)) {
      client.id(id);
      client.host(client.host() || false);
      return this.set(client);
    }

    client.id(id);
    client.host(client.host() || false);

    if (client.host()) {
      this.hostId = id;
    }

    this.arr.push(client);
    this.arrIds.push(id);
    return client;
  }

  set(client) {
    let index = this.arrIds.indexOf(client.id());
    this.arr[index] = client;
    return client;
  }

  remove(id) {
    let i = this.arrIds.indexOf(id);

    if (i != -1) {
      this.arr.splice(i, 1);
      this.arrIds.splice(i, 1);
    }
  }

  setHost(id) {
    if (this.has(id)) {
      if (this.hostId > -1) {
        this.get(this.hostId).host(false);
      }

      this.hostId = id;
      let stream = this.get(id);
      stream.host(true);
    }
  }

  host() {
    return this.get(this.hostId);
  }

  export() {
    let clients = [];
    let it = this.iterator();

    while (it.hasNext()) {
      let cl = it.remove();
      clients.push({
        id: cl.id(),
        isHost: cl.host()
      });
    }

    return clients;
  }

  iterator() {
    return new _iteration2.default(this.arr, true);
  }

}

exports.ClientList = ClientList;