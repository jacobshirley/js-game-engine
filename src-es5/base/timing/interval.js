"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Interval extends _events2.default {
  constructor(target, useTicks) {
    super();
    this.target = target;
    this.inc = 0;
    this.useTicks = useTicks;
  }

  reset(counter) {
    this.inc = 0;
  }

  update(counter) {
    let i = counter.deltaTime;
    if (this.useTicks) i = 1;
    this.inc += i;

    if (this.inc >= this.target) {
      this.emit('complete');
      this.reset();
    }
  }

}

exports.default = Interval;