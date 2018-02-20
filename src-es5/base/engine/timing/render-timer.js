"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _delay = require("./delay.js");

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RenderTimer extends _timer2.default {
  constructor() {
    super();
    this.delay = null;
  }

  setMaxFrames(max) {
    let delay = new MaxFrameDelay(1000.0 / max);

    if (this.delay == null) {
      this.delay = delay;
      this.addDelay(this.delay);
    }
  }

  render() {}

}

exports.default = RenderTimer;

class MaxFrameDelay extends _delay2.default {
  constructor(frameInterval) {
    super();
    this.frameInterval = frameInterval;
  }

  delete() {
    return false;
  }

  start(counter) {
    this.then = counter.time;
  }

  complete(counter) {
    let now = counter.time;
    let delta = now - this.then;

    if (delta > this.frameInterval) {
      this.emit('complete');
      this.then = now - delta % this.frameInterval;
      return true;
    }

    return false;
  }

}