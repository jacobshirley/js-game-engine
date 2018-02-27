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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepEngine {
  constructor(game, config) {
    this.game = game;
    this.config = config;
    this.clientInterface = config.clientInterface;

    if (this.clientInterface.connected) {
      this._build();
    } else {
      this.clientInterface.on("connected", () => {
        this._build();
      });
    }

    this.tabActive = true;

    if (typeof window !== 'undefined') {
      $(window).focus(() => {
        this.tabActive = true;
      });
      $(window).blur(() => {
        this.tabActive = false;
      });
    }
  }

  get isServer() {
    return this.clientInterface.getLocalClient().host();
  }

  _build() {
    this.queue = new _lockstepQueue2.default(this.clientInterface.getLocalClient(), this.clientInterface.getClients());
    this.logicTimer = new _lockstepTimer2.default(this.queue, 5, 2, 50);
    this.queue.addProcessor(this.logicTimer);
    this.renderTimer = new _gameTimer2.default(this.logicTimer);
    this.controllers = new _controllers2.default(this.queue);

    if (!this.config.headless) {
      this.renderTimer.setRenderFunction(() => {
        this.game.render();
      });
    } else {
      this.renderTimer.setRenderFunction(() => {});
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
    if (this.clientInterface.connected) {
      this.renderTimer.render();
    } else {
      this.clientInterface.update();
    }
  }

  start() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (document.visibilityState === "hidden") {
          this.update();
        }
      }, 1000 / 128);

      this._start();
    }
  }

  _start() {
    requestAnimationFrame(() => {
      this.update();

      this._start();
    });
  }

}

exports.default = LockstepEngine;