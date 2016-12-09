class Delay {
	constructor(delay, inTicks) {
		this.timer = null;

		this.delay = delay;
		this.inTicks = inTicks;

		this.marker = 0;
		this.onFinished = null;
	}

	start() {
		if (!this.timer)
			return;

		if (!this.inTicks) {
			this.marker = this.timer.time;
		} else {
			this.marker = this.timer.tick;
		}
		this.marker += this.delay;
	}

	isDone() {
		if (!this.timer)
			return false;
		
		let bool = false;
		if (this.inTicks) {
			bool = this.timer.tick >= this.marker;
		} else {
			bool = this.timer.time >= this.marker;
		}
		if (bool) {
			if (this.onFinished)
				this.onFinished();
		}
		return bool;
	}
}

class Interval {
	constructor(ticks, func) {
		this.tick = 0;
		this.ticks = ticks;
		this.func = func;
	}

	reset() {
		this.tick = 0;
	}
}

class Timer {
	constructor() {
		this.tick = 0;
		this.delays = [];
		this.intervals = [];
	}

	reset() {
		this.tick = 0;
		this.delays = [];
		this.intervals = [];
	}

	addDelay(delay) {
		delay.timer = this;
		delay.start();

		this.delays.push(delay);
	}

	addInterval(interval) {
		interval.reset();
		this.intervals.push(interval);
	}

	update(main) {
		this.tick++;

		let delayed = false;
		let c = 0;

		for (let delay of this.delays) {
			if (!delay.isDone())
				delayed = true;
			else {
				this.delays.splice(c, 1);
			}
			c++;
		}

		for (let interval of this.intervals) {
			interval.tick++;
			if (interval.tick == interval.ticks) {
				interval.reset();
				interval.func();
			}
		}

		if (delayed)
			return false;

		return main();
	}
}