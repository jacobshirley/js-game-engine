import GameTimer from "../base/timing/game-timer.js";
import Interval from "../base/timing/interval.js";
import Delay from "../base/timing/delay.js";
import LockstepQueueError from "./lockstep-queue-error.js";

export default class LockstepTimer extends GameTimer {
	constructor(client, delay = 5, minDelay = 2, maxDelay = 10, resetDelay = 50, syncInterval = 5) {
		super();

		this.client = client;
		this.delay = delay;
		this.minDelay = minDelay;
		this.maxDelay = maxDelay;
		this.resetDelay = resetDelay;
		this.syncInterval = syncInterval;
		this._inited = false;
		this._resetTick = 0;
		this._requestedReset = false;
		this._minUpdates = 0;

		if (this.client.isHost) {
			let interval = new Interval(this.syncInterval, true);

			interval.on('complete', () => {
				this.client.push({name: "HOST_TICK", tick: this.logicTimer.tick, time: this.logicTimer.time}, true);
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
		if (this.client.isHost) {
			if (update.name == "CLIENT_ADDED" || update.name == "REQUEST_RESET") {
				this.client.push({name: "INIT_TICK", target: update.id || update.__clId, tick: this.logicTimer.tick}, true);
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
					//console.log("SDFFD");
					this._resetTick += this.delay;
					this.logicTimer.addDelay(new Delay(this.delay, true));
				} else if (diff < 0 || diff >= this.resetDelay) {
					this._requestedReset = true;
				//	console.log(update.__updateId+", "+this.logicTimer.tick+", "+diff+", " + this._resetTick);
					this.client.push({name: "REQUEST_RESET"}, true);
				} else if (diff > this.maxDelay) {
					//console.log(diff);
					this.updateTime = this.logicInterval * (Math.max(0, diff - this.delay));
				}
			}
		} else if (update.name == "INIT_TICK" && update.target == this.client.local.id()) {
			this._requestedReset = false;

			this.logicTimer.tick = update.tick - 1;
			this._resetTick = update.tick + this.delay;

			this.updateTime = 0;
			this.deltaTime = this.logicInterval;

			//console.log(update.__updateId +" init tick");
			//console.log(this.client.clients);
		//	console.log("yay");
			this.addDelay(new Delay(this.delay, true));

			this._inited = true;
		} else if (update.name == "RESET_CLOCK") {

		}
	}
}
