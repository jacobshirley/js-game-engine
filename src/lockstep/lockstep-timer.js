import GameTimer from "../base/timing/game-timer.js";
import Interval from "../base/timing/interval.js";
import Delay from "../base/timing/delay.js";
import LockstepQueueError from "./lockstep-queue-error.js";

export default class LockstepTimer extends GameTimer {
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
		this._processed = 0;

		if (this.queue.isHost) {
			let interval = new Interval(this.syncInterval, true);

			interval.on('complete', () => {
				this.queue.pushFramed({name: "PROCESSED_UPDATES", processedUpdates: this._processed}, true);
				this.queue.push({name: "HOST_TICK", tick: this.logicTimer.tick, time: this.logicTimer.time}, true);
			});

			this.logicTimer.addInterval(interval);
		}

		this.setMaxCatchup(10);
	}

	update(main) {
		try {
			return super.update(main);
		} catch (e) {
			if (e instanceof LockstepQueueError) {
				console.log("Haven't got all the updates. Restarting...");
				this.engine.restart();
			} else
				throw e;
		}
	}

	process(update) {
		if (!update.__local && typeof update.frame !== 'undefined')
			this._processed++;

		if (this.queue.isHost) {
			if (update.name == "CLIENT_ADDED" || update.name == "REQUEST_RESET") {
				this.queue.push({name: "INIT_TICK", target: update.id || update.__clId, tick: this.logicTimer.tick, processedUpdates: this._processed}, true);
			}

			return;
		}

		if (update.name == "HOST_TICK") {
			if (!this._inited)
				return;

			let diff = update.tick - this.logicTimer.tick;

			if (!this._requestedReset && this._resetTick < update.tick) {
				if (diff >= 0 && diff <= this.minDelay) {
					this._resetTick += this.delay;
					this.logicTimer.addDelay(new Delay(this.delay, true));
				} else if (diff < 0 || diff >= this.resetDelay) {
					this._requestedReset = true;

					this.engine.restart();
				} else if (diff > this.maxDelay) {
					this.updateTime = this.logicInterval * (Math.max(0, diff - this.delay));
				}
			}
		} else if (update.name == "INIT_TICK" && update.target == this.queue.local.id()) {
			this._requestedReset = false;

			this.logicTimer.tick = update.tick - 1;
			this._resetTick = update.tick + this.delay;

			this.updateTime = 0;
			this.deltaTime = this.logicInterval;

			this._processed = update.processedUpdates;

			this.addDelay(new Delay(this.delay, true));

			this._inited = true;

			this.queue.push({name: "SET_CLOCK"});
		} else if (update.name == "PROCESSED_UPDATES") {
			if (!this._inited)
				return;

			if (this._processed != update.processedUpdates) {
				//work in progress to try to detect client drift
			}
		}
	}
}
