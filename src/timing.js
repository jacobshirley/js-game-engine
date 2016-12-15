class Delay extends EventEmitter{
	constructor(delay) {
		super();

		this.timer = null;

		this.delay = delay;

		this.marker = 0;
	}

	start() {
		if (!this.timer)
			return;

		this.marker = this.timer.tick + this.delay;
	}

	isDone() {
		if (!this.timer)
			return false;
		
		let bool = this.timer.tick >= this.marker;
		if (bool) {
			this.emit('finished');
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
		this.time = this.oldTime = Timer.currentTime;
		this.delays = [];
		this.intervals = [];
		this.parent = null;
	}

	static get currentTime() {
		return new Date().getTime();
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

	tether(parent) {
		this.parent = parent;
	}

	setTick(newTick, reset) {
		this.tick = newTick;
		for (let delay of this.delays) {
			//delay.start();
		}

		for (let interval of this.intervals) {
			interval.reset();
		}
	}

	getTick() {
		return this.tick;
	}

	update(main) {
		if (!this.parent) {
			this.tick++;
			this.time += Timer.currentTime-this.oldTime;
		} else {
			this.tick = this.parent.tick;
			this.time = this.parent.time;
		}

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

		if (delayed) {
			return false;
		}

		return main();
	}
}