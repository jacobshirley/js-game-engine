"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iteration = require("../../engine/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _stream = require("../../engine/updates/streamed/stream.js");

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Packet extends _stream2.default {
  constructor(from, string) {
    super();
    this.from = from;
    this.string = string;
  }

  decode() {
    this.updates = JSON.parse(this.string);
  }

  json() {
    return {
      server: this.from === 0,
      from: this.from,
      data: this.string
    };
  }

  iterator() {
    return new _iteration2.default(this.updates, true);
  }

}

exports.default = Packet;