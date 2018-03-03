"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lockstepQueue = require("./lockstep-queue.js");

var _lockstepQueue2 = _interopRequireDefault(_lockstepQueue);

var _lockstepTimer = require("./lockstep-timer.js");

var _lockstepTimer2 = _interopRequireDefault(_lockstepTimer);

var _gameTimer = require("../base/timing/game-timer.js");

var _gameTimer2 = _interopRequireDefault(_gameTimer);

var _interval = require("../base/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _controllers = require("../base/controller/controllers.js");

var _controllers2 = _interopRequireDefault(_controllers);

var _events = require("../base/shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepEngine extends _events2.default {
  constructor(game, config) {
    super();
    this.game = game;
    this.config = config;
    this.clientInterface = config.clientInterface;
    if (this.clientInterface.connected) this._build();
    this.clientInterface.on("connected", () => {
      this._build();
    });
  }

  get isServer() {
    return this.clientInterface.getLocalClient().host();
  }

  _build() {
    this.queue = new _lockstepQueue2.default(this.clientInterface.getLocalClient(), this.clientInterface.getClients());
    this.renderTimer = new _lockstepTimer2.default(this, 7, 2, 10, 1000);
    this.logicTimer = this.renderTimer.logicTimer;
    this.queue.addProcessor(this.renderTimer);
    this.controllers = new _controllers2.default(this.queue);

    if (!this.config.headless) {
      this.renderTimer.setRenderFunction(() => {
        this.game.render();
        if (this.shouldRestart) this._restart();
      });
    } else {
      this.renderTimer.setRenderFunction(() => {
        if (this.shouldRestart) this._restart();
      });
    }

    this.renderTimer.setLogicFunction(frame => {
      this.clientInterface.update(frame);
      this.queue.update(frame);
      this.game.logic(frame);
    });
    if (typeof this.config.maxFPS !== 'undefined') this.renderTimer.setMaxFrames(this.config.maxFPS);
    if (typeof this.config.updatesPerSecond !== 'undefined') this.renderTimer.setUpdateRate(this.config.updatesPerSecond);
    const sendInterval = new _interval2.default(this.config.sendOnFrame, true);
    sendInterval.on('complete', () => {
      this.clientInterface.flush(); //console.log(this.getDebugString());
    });
    this.logicTimer.addInterval(sendInterval);
    this.game.setEngine(this);
    this.game.init();
  }

  getDebugString() {
    return "FPS: " + this.renderTimer.fps + "<br />" + "UPS: " + this.renderTimer.ups + "<br />" + "Frame: " + this.logicTimer.tick + "<br />" + "Net updates: " + this.queue.processedUpdates;
  }

  update() {
    if (this.clientInterface.connected && this.renderTimer) {
      this.renderTimer.render();
    } else {
      this.clientInterface.update();
    }
  }

  start() {
    this._start();
  }

  _start() {
    requestAnimationFrame(() => {
      this.update();

      this._start();
    });
  }

  restart() {
    this.shouldRestart = true;
  }

  _restart() {
    this.shouldRestart = false;
    this.renderTimer.reset();
    this.logicTimer.reset();
    this.renderTimer = null;
    this.logicTimer = null;
    this.emit("restart", this);
    this.controllers.destroy();
    this.game.destroy(); //this.game.restart();

    this.clientInterface.reset();
  }

}

exports.default = LockstepEngine;