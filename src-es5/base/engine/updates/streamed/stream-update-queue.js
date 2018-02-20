"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateQueue = require("../update-queue.js");

var _updateQueue2 = _interopRequireDefault(_updateQueue);

var _iteration = require("../iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StreamUpdateQueue extends _updateQueue2.default {
  constructor(local, clients) {
    super();
    this.local = local;
    this.clients = clients;
    this.toBeFramed = [];
  }

  get isHost() {
    return this.local.host();
  }

  push(update, networked) {
    this.local.push(update, networked);
  }

  pushFramed(update, networked) {
    this.local.pushFramed(update, networked);
  }

  update(frame) {}

}

exports.default = StreamUpdateQueue;