"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gameTimer = require("../base/timing/game-timer.js");

var _gameTimer2 = _interopRequireDefault(_gameTimer);

var _interval = require("../base/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _delay = require("../base/timing/delay.js");

var _delay2 = _interopRequireDefault(_delay);

var _lockstepQueueError = require("./lockstep-queue-error.js");

var _lockstepQueueError2 = _interopRequireDefault(_lockstepQueueError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepTimer extends _gameTimer2.default {
  constructor(engine, delay = 5, minDelay = 2, maxDelay = 10, resetDelay = 5000, syncInterval = 5) {
    super();
    this.engine = engine;
    this.queue = engine.queue;
    this.delay = delay;
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
    this.resetDelay = resetDelay;
    this.syncInterval = syncInterval;
    this._inited = false;
    this._resetTick = 0;
    this._requestedReset = false;
    this._minUpdates = 0;

    if (this.queue.isHost) {
      let interval = new _interval2.default(this.syncInterval, true);
      interval.on('complete', () => {
        this.queue.push({
          name: "HOST_TICK",
          tick: this.logicTimer.tick,
          time: this.logicTimer.time
        }, true);
      });
      this.logicTimer.addInterval(interval);
    }

    this.setMaxCatchup(10);
  }

  update(main) {
    //try {
    return super.update(main);
    /*} catch (e) {
    	if (e instanceof LockstepQueueError) {
    		console.log("LockstepError: Delaying");
    		this.addDelay(new Delay(this.delay, true));
    	} else
    		throw e;
    }*/
  }

  process(update) {
    if (this.queue.isHost) {
      if (update.name == "CLIENT_ADDED" || update.name == "REQUEST_RESET") {
        this.queue.push({
          name: "INIT_TICK",
          target: update.id || update.__clId,
          tick: this.logicTimer.tick
        }, true);
      } else if (update.name == "REFRESH_NET") {//	this.queue.push({name: "RESET_MAGIC", })
      }

      return;
    }

    if (update.name == "HOST_TICK") {
      if (!this._inited) return;
      let diff = update.tick - this.logicTimer.tick; //console.log(diff);

      if (!this._requestedReset && this._resetTick < update.tick) {
        if (diff >= 0 && diff <= this.minDelay) {
          this._resetTick += this.delay;
          this.logicTimer.addDelay(new _delay2.default(this.delay, true));
        } else if (diff < 0 || diff >= this.resetDelay) {
          this._requestedReset = true; //this.clientInterface.clear();
          //	this.client.push({name: "REFRESH_NET"}, true);

          this.engine.restart();
        } else if (diff > this.maxDelay) {
          this.updateTime = this.logicInterval * Math.max(0, diff - this.delay);
        }
      }
    } else if (update.name == "INIT_TICK" && update.target == this.queue.local.id()) {
      this._requestedReset = false;
      this.logicTimer.tick = update.tick - 1;
      this._resetTick = update.tick + this.delay;
      this.updateTime = 0;
      this.deltaTime = this.logicInterval;
      this.addDelay(new _delay2.default(this.delay, true));
      this._inited = true;
    } else if (update.name == "RESET_CLOCK") {}
  }

}

exports.default = LockstepTimer;