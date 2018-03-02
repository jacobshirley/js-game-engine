import GameTimer from "../base/timing/game-timer.js";
import Interval from "../base/timing/interval.js";
import Delay from "../base/timing/delay.js";
import LockstepQueueError from "./lockstep-queue-error.js";

export default class LockstepTimer extends GameTimer {
	constructor(engine, delay = 5, minDelay = 2, maxDelay = 10, resetDelay = 5000, syncInterval = 50) {
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
			let interval = new Interval(this.syncInterval, true);

			interval.on('complete', () => {
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
				console.log("LockstepError: Delaying");
				this.addDelay(new Delay(this.delay, true));
			} else throw e;
		}
	}

	process(update) {
		if (this.queue.isHost) {
			if (update.name == "CLIENT_ADDED" || update.name == "REQUEST_RESET") {
				this.queue.push({name: "INIT_TICK", target: update.id || update.__clId, tick: this.logicTimer.tick}, true);
			}

			return;
		}

		if (update.name == "HOST_TICK") {
			if (!this._inited)
				return;

			let diff = update.tick - this.logicTimer.tick;
			console.log(diff);

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

			this.addDelay(new Delay(this.delay, true));

			this._inited = true;
		} else if (update.name == "RESET_CLOCK") {

		}
	}
}
