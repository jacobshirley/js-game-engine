"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Delay extends _events2.default {
  constructor(delay, useTicks) {
    super();
    this.delay = delay;
    this.useTicks = useTicks;
    this.marker = 0;
  }

  delete(counter) {
    return true;
  }

  start(counter) {
    if (!counter) return;
    let i = counter.tick;
    if (!this.useTicks) i = counter.time;
    this.marker = i + this.delay;
  }

  complete(counter) {
    if (!counter) return false;
    let i = counter.tick;
    if (!this.useTicks) i = counter.time;
    let bool = i >= this.marker;

    if (bool) {
      this.emit('complete');
    } else {
      this.emit('delay');
    }

    return bool;
  }

}

exports.default = Delay;