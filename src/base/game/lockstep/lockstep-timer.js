import Timer from "../../engine/timing/timer.js";
import Interval from "../../engine/timing/interval.js";
import Delay from "../../engine/timing/delay.js";
import LockstepQueueError from "./lockstep-queue-error.js";

export default class LockstepTimer extends Timer {
	constructor(client, delay, maxDelay = 50, syncInterval = 5) {
		super();

		this.client = client;
		this.delay = delay;
		this.maxDelay = maxDelay;
		this.syncInterval = syncInterval;

		let interval = new Interval(syncInterval, true);

		interval.on('complete', () => {
			if (this.client.isHost) {
				this.client.push({name: "HOST_TICK", tick: this.tick, time: this.time});
			}
		});

		this.addInterval(interval);
	}

	update(main) {
		try {
			return super.update(main);
		} catch (e) {
			if (e instanceof LockstepQueueError) {
				console.log("Delaying");
				this.addDelay(new Delay(this.delay, true));
			} else throw e;
		}
	}

	process(update) {
		if (update.name == "HOST_TICK") {
			if (update.tick - this.tick > this.maxDelay) {
				this.tick = update.tick - 1;
				this.time = update.time;

				this.addDelay(new Delay(this.delay, true));
			}
		}
	}
}
