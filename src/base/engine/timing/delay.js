import EventEmitter from "../../shims/events.js";

export default class Delay extends EventEmitter {
	constructor(delay, useTicks) {
		super();

		this.delay = delay;
		this.useTicks = useTicks;

		this.marker = 0;
	}

    delete(counter) {
        return true;
    }

	start(counter) {
		if (!counter)
			return;

		let i = counter.tick;
		if (!this.useTicks)
			i = counter.time;

		this.marker = i + this.delay;
	}

	complete(counter) {
		if (!counter)
			return false;

		let i = counter.tick;
		if (!this.useTicks)
			i = counter.time;

		let bool = i >= this.marker;
		if (bool) {
			this.emit('complete');
		} else {
			this.emit('delay');
		}
		return bool;
	}
}
