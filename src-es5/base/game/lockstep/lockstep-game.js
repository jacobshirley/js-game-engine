"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _game = require("../game.js");

var _game2 = _interopRequireDefault(_game);

var _lockstepQueue = require("./lockstep-queue.js");

var _lockstepQueue2 = _interopRequireDefault(_lockstepQueue);

var _lockstepTimer = require("./lockstep-timer.js");

var _lockstepTimer2 = _interopRequireDefault(_lockstepTimer);

var _gameTimer = require("../../engine/timing/game-timer.js");

var _gameTimer2 = _interopRequireDefault(_gameTimer);

var _interval = require("../../engine/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _controllers = require("../../controller/controllers.js");

var _controllers2 = _interopRequireDefault(_controllers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepGame extends _game2.default {
  constructor(config) {
    super();
    this.config = config;
    this.multiplayer = config.multiplayer;
    this.renderer = config.renderer;

    if (this.multiplayer.connected) {
      this._build();
    } else {
      this.multiplayer.on("connected", () => {
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
    return this.multiplayer.getLocalClient().host();
  }

  _build() {
    this.queue = new _lockstepQueue2.default(this.multiplayer.getLocalClient(), this.multiplayer.getClients());
    this.timer = new _lockstepTimer2.default(this.queue, 3, 2, 50);
    this.controllers = new _controllers2.default(this.queue);
    this.queue.addProcessor(this.timer);
    this.renderTimer = new _gameTimer2.default(this.timer);

    if (!this.config.headless) {
      this.renderTimer.setRenderFunction(() => {
        this.render();
      });
    } else {
      this.renderTimer.setRenderFunction(() => {});
    }

    this.renderTimer.setLogicFunction(frame => {
      this.multiplayer.update(frame);
      this.queue.update(frame);
      this.logic(frame);
    });
    if (typeof this.config.maxFPS !== 'undefined') this.renderTimer.setMaxFrames(this.config.maxFPS);
    if (typeof this.config.updatesPerSecond !== 'undefined') this.renderTimer.setUpdateRate(this.config.updatesPerSecond);
    const sendInterval = new _interval2.default(this.config.sendOnFrame, true);
    sendInterval.on('complete', () => {
      this.multiplayer.flush();
    });
    this.renderTimer.addInterval(sendInterval);
    this.init();
  }

  getDebugString() {
    return "FPS: " + this.renderTimer.fps + "<br />" + "UPS: " + this.renderTimer.ups + "<br />" + "Frame: " + this.timer.tick + "<br />" + "Net updates: " + this.queue.processedUpdates;
  }

  update() {
    if (this.multiplayer.connected && this.renderTimer) {
      this.renderTimer.render();
    } else {
      this.multiplayer.update();
    }
  }

  start() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (document.visibilityState == "hidden") {
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

exports.default = LockstepGame;