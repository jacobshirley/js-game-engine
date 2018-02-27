"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _timer = require("../../engine/timing/timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _interval = require("../../engine/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _delay = require("../../engine/timing/delay.js");

var _delay2 = _interopRequireDefault(_delay);

var _lockstepQueueError = require("./lockstep-queue-error.js");

var _lockstepQueueError2 = _interopRequireDefault(_lockstepQueueError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockstepTimer extends _timer2.default {
  constructor(client, delay, minDelay = 5, maxDelay = 50, syncInterval = 5) {
    super();
    this.init = false;
    this.client = client;
    this.delay = delay;
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
    this.syncInterval = syncInterval;
    this._resetTick = 0;

    if (this.client.isHost) {
      let interval = new _interval2.default(syncInterval, true);
      interval.on('complete', () => {
        this.client.push({
          name: "HOST_TICK",
          tick: this.tick,
          time: this.time
        }, true);
      });
      this.addInterval(interval);
    }
  }

  update(main) {
    try {
      return super.update(main);
    } catch (e) {
      if (e instanceof _lockstepQueueError2.default) {
        console.log("LockstepError: Delaying");
        this.addDelay(new _delay2.default(this.delay, true));
      } else throw e;
    }
  }

  process(update) {
    if (this.client.isHost) {
      if (update.name == "CLIENT_ADDED") {
        //console.log("client added");
        this.client.push({
          name: "INIT_TICK",
          tick: this.tick,
          time: this.time
        }, true);
      }

      return;
    }

    if (update.name == "HOST_TICK") {
      if (!this.init) return;
      let diff = update.tick - this.tick;

      if (this._resetTick < update.tick && diff <= this.minDelay) {
        console.log("Delaying " + diff);
        this._resetTick += this.delay;
        this.addDelay(new _delay2.default(this.delay, true));
      } else if (diff > this.maxDelay) {
        /*this.tick = update.tick - 30;
        this.time = update.time;
        		this.client.push({name: "RESET_CLOCK"}, false);*/
      }
    } else if (update.name == "INIT_TICK") {
      if (this.init) return;
      this.tick = update.tick - 1;
      this.time = update.time;
      this._resetTick = this.tick + this.delay;
      this.addDelay(new _delay2.default(this.delay, true));
      this.init = true;
    }
  }

}

exports.default = LockstepTimer;