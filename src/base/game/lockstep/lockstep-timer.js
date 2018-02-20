import Timer from "../../engine/timing/timer.js";
import Interval from "../../engine/timing/interval.js";
import Delay from "../../engine/timing/delay.js";
import LockstepQueueError from "./lockstep-queue-error.js";

export default class LockstepTimer extends Timer {
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
			let interval = new Interval(syncInterval, true);

			interval.on('complete', () => {
				this.client.push({name: "HOST_TICK", tick: this.tick, time: this.time}, true);
			});

			this.addInterval(interval);
		}
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
			if (update.name == "CLIENT_ADDED") {
				//console.log("client added");
				this.client.push({name: "INIT_TICK", tick: this.tick, time: this.time}, true);
			}

			return;
		}

		if (update.name == "HOST_TICK") {
			if (!this.init)
				return;

			let diff = update.tick - this.tick;

			if (this._resetTick < update.tick && (diff <= this.minDelay)) {
				//console.log("Delaying " + diff);

				this._resetTick += this.delay;
				this.addDelay(new Delay(this.delay, true));
			} else if (diff > this.maxDelay) {
				/*this.tick = update.tick - 30;
				this.time = update.time;

				this.client.push({name: "RESET_CLOCK"}, false);*/

				
			}
		} else if (update.name == "INIT_TICK") {
			if (this.init)
				return;

			this.tick = update.tick - 1;
			this.time = update.time;

			this._resetTick = this.tick + this.delay;
			this.addDelay(new Delay(this.delay, true));

			this.init = true;
		}
	}
}
