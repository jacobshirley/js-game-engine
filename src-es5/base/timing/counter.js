"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function currentTime() {
  return Date.now();
}

class Counter {
  constructor() {
    this._oldTime = 0;
    this.time = 0;
    this.tick = 0;
    this.deltaTime = 0;
  }

  update() {
    this.tick++;

    if (this.tick == 1) {
      this._oldTime = currentTime();
    }

    let curTime = currentTime();
    this.deltaTime = curTime - this._oldTime;
    this._oldTime = curTime;
    this.time += this.deltaTime;
  }

}

exports.default = Counter;