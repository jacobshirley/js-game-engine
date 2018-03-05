"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalClientUpdateStream = exports.ClientUpdateStream = undefined;

var _client = require("../client.js");

var _client2 = _interopRequireDefault(_client);

var _iteration = require("../iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ClientUpdateStream extends _client2.default {
  constructor(id, isHost) {
    super(id, isHost);
    this.updates = [];
    this.toBeRead = 0;
    this._cachedUpdates = [];
  }

  push(update) {
    this.updates.push(update);
  }

  cache(updates) {
    this._cachedUpdates = this._cachedUpdates.concat(updates);
  }

  clear() {
    this._cachedUpdates = [];
    this.updates = [];
  }

  recv() {
    this.updates = this.updates.concat(this._cachedUpdates.splice(0));
  }

  iterator() {
    return new _iteration2.default(this.updates, false);
  }

  export() {
    let ex = super.export();
    ex.toBeRead = this.toBeRead;
    ex.updates = this.updates;
    return ex;
  }

}

exports.ClientUpdateStream = ClientUpdateStream;

class LocalClientUpdateStream extends ClientUpdateStream {
  constructor(connection, id, isHost) {
    super(id, isHost);
    this.connection = connection;
    this.localUpdates = [];
    this.toBeSent = [];
    this.toBeFramed = [];
    this.toBeFramedNet = [];
    this.updateID = 0;
  }

  push(update, networked) {
    if (networked) {
      super.push(update);
      update.__updateId = this.updateID++;
      this.toBeSent.push(update);
    } else {
      this.localUpdates.push(update);
    }
  }

  pushFramed(update, networked) {
    if (networked) this.toBeFramedNet.push(update);else this.toBeFramed.push(update);
  }

  stage(updates, frame, networked) {
    while (updates.length > 0) {
      let u = updates.shift();
      u.frame = frame;
      this.push(u, networked);
    }
  }

  update(frame) {
    this.stage(this.toBeFramed, frame, false);
    this.stage(this.toBeFramedNet, frame, true);
  }

  flush() {
    let updates = this.toBeSent;

    if (updates.length > 0) {
      this.connection.send(updates.splice(0));
    }
  }

}

exports.LocalClientUpdateStream = LocalClientUpdateStream;