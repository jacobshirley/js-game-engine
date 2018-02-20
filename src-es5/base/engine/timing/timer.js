"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _counter = require("./counter.js");

var _counter2 = _interopRequireDefault(_counter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Timer extends _counter2.default {
  constructor() {
    super();
    this.delayCounter = new _counter2.default();
    this.delays = [];
    this.intervals = [];
    this.parent = null;
    this.tetherables = [];
    this.delayed = false;
    this.paused = false;
  }

  static get currentTime() {
    return Date.now();
  }

  reset() {
    this.tick = 0;
    this.delays = [];
    this.intervals = [];
  }

  addDelay(delay) {
    delay.start(this.delayCounter);
    this.delays.push(delay);
  }

  addInterval(interval) {
    interval.reset(this);
    this.intervals.push(interval);
  }

  addTetherable(child) {
    this.tetherables.push(child);
  }

  removeTetherable(child) {
    this.tetherables.splice(this.tetherables.indexOf(child), 1);
  }

  tether(parent) {
    this.parent = parent;
    this.parent.addTetherable(this);
  }

  untether() {
    this.parent = null;
    this.parent.removeTetherable(this);
  }

  setTick(newTick) {
    this.tick = newTick;

    for (let interval of this.intervals) {
      interval.reset(this);
    }
  }

  getTick() {
    return this.tick;
  }

  update(main) {
    if (!this.paused) {
      this.delayCounter.update(this);
      let delayed = false;
      let delays = this.delays;

      for (var i = 0; i < delays.length; i++) {
        let delay = delays[i];
        if (!delay.complete(this.delayCounter)) delayed = true;else if (delay.delete()) {
          delays.splice(i, 1);
        }
      }

      if (delayed) {
        return false;
      }

      if (!this.parent) {
        super.update();
      } else {
        this.tick = this.parent.tick;
        this.time = this.parent.time;
      }

      for (let tetherable of this.tetherables) {
        tetherable.tick = this.tick;
        tetherable.time = this.time;
      }

      for (let interval of this.intervals) {
        interval.update(this);
      }

      if (main) return main();
    }

    return false;
  }

}

exports.default = Timer;