"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _renderTimer = require("./render-timer.js");

var _renderTimer2 = _interopRequireDefault(_renderTimer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_UPDATE_RATE = 1000 / 60;

class GameTimer extends _renderTimer2.default {
  constructor(logicTimer, renderFunc, logicFunc) {
    super();

    this.renderFunc = renderFunc || (() => {});

    this.logicFunc = logicFunc || (() => {});

    this.logicInterval = DEFAULT_UPDATE_RATE;
    this.logicTimer = logicTimer || new _timer2.default();
    this.renderTime = 0;
    this.updateTime = 0;
    this.fps = 0;
    this.tempFPS = 0;
    this.ups = 0;
    this.tempUPS = 0;
  }

  setRenderFunction(func) {
    this.renderFunc = func;
  }

  setLogicFunction(func) {
    this.logicFunc = func;
  }

  setUpdateRate(updateRate) {
    this.logicInterval = 1000 / updateRate;
  }

  getDebugString() {
    return "Tick: " + this.logicTimer.tick + "<br /> Time (ms): " + this.logicTimer.time + "<br /> FPS: " + this.fps + "<br /> UPS: " + this.ups;
  }

  update() {
    let t = 0;

    while (this.updateTime >= this.logicInterval && t < 65) {
      // < 65 so it can catch up and doesn't go crazy
      if (!this.logicTimer.update(() => {
        this.logicFunc(this.logicTimer.tick);
        t++;
        this.updateTime -= this.logicInterval;
        this.tempUPS++;
        return true;
      })) {
        this.updateTime -= this.logicInterval;
      }
    }
  }

  render() {
    return super.update(() => {
      this.update();
      this.renderFunc();
      this.renderTime += this.deltaTime;
      this.updateTime += this.deltaTime;
      this.tempFPS++;

      if (this.renderTime >= 1000) {
        this.fps = this.tempFPS;
        this.ups = this.tempUPS;
        this.renderTime = 0;
        this.tempFPS = 0;
        this.tempUPS = 0;
      }

      return true;
    });
  }

}

exports.default = GameTimer;