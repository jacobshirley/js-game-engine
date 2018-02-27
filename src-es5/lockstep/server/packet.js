"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iteration = require("../../base/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _stream = require("../../base/updates/streamed/stream.js");

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Packet extends _stream2.default {
  constructor(from, string, server) {
    super();
    this.from = from;
    this.string = string;
    this.server = typeof server == "undefined" ? false : server;
  }

  decode() {
    this.updates = JSON.parse(this.string);
  }

  json() {
    return {
      server: this.server,
      from: this.from,
      data: this.string
    };
  }

  iterator() {
    return new _iteration2.default(this.updates, true);
  }

}

exports.default = Packet;