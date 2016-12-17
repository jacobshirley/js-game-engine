class Delay extends EventEmitter {
	constructor() {
		super();

		this.counter = null;
	}

	delete() {
		return true;
	}

	start() {

	}

	complete() {

	}
}

class IncDelay extends Delay{
	constructor(delay, useTicks) {
		super();

		this.delay = delay;
		this.useTicks = useTicks;

		this.marker = 0;
	}

	start() {
		if (!this.counter)
			return;

		let i = this.counter.tick;
		if (!this.useTicks)
			i = this.counter.time;

		this.marker = i + this.delay;
	}

	complete() {
		if (!this.counter)
			return false;

		let i = this.counter.tick;
		if (!this.useTicks)
			i = this.counter.time;
		
		let bool = i >= this.marker;
		if (bool) {
			this.emit('complete');
		} else {
			this.emit('delay');
		}
		return bool;
	}
}

class MaxFrameDelay extends Delay{
	constructor(frameInterval) {
		super();

		this.frameInterval = frameInterval;
	}

	delete() {
		return false;
	}

	start() {
		this.then = this.counter.time;
	}

	complete() {
		let now = this.counter.time;
		let delta = now-this.then;

		if (delta > this.frameInterval) {
			this.emit('complete');
			this.then = now - (delta % this.frameInterval);
			return true;
		}
		return false;
	}
}

class Interval extends EventEmitter {
	constructor(target, useTicks) {
		super();

		this.target = target;
		this.inc = 0;
		this.useTicks = useTicks;
		this.counter = null;
	}

	reset() {
		this.inc = 0;
	}

	update() {
		let i = this.counter.deltaTime;
		if (this.useTicks)
			i = 1;

		this.inc += i;
		if (this.inc >= this.target) {
			this.emit('complete');
			this.reset();
		}
	}
}

class Counter {
	constructor() {
		this._oldTime = 0;
		this.time = 0;
		this.tick = 0;
		this.deltaTime = 0;
	}

	update() {
		this.tick++;

		if (this.tick == 1) {
			this._oldTime = Timer.currentTime;
		}

		let curTime = Timer.currentTime;
		this.deltaTime = curTime-this._oldTime;
		this._oldTime = curTime;

		this.time += this.deltaTime;
	}
}

class Timer extends Counter{
	constructor() {
		super();

		this.delayCounter = new Counter();
		this.delays = [];

		this.intervals = [];

		this.parent = null;
		this.tetherables = [];

		this.delayed = false;
		this.paused = false;
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
		delay.counter = this.delayCounter;
		delay.start();

		this.delays.push(delay);
	}

	addInterval(interval) {
		interval.counter = this;
		interval.reset();

		this.intervals.push(interval);
	}

	addTetherable(child) {
		this.tetherables.push(child);
	}

	removeTetherable(child) {
		this.tetherables.splice(this.tetherables.indexOf(child), 1);
	}

	tether(parent) {
		this.parent = parent;
		this.parent.addTetherable(this);
	}

	untether() {
		this.parent = null;
		this.parent.removeTetherable(this);
	}

	setMaxFrames(max) {
		this.addDelay(new MaxFrameDelay(1000.0/max));
	}

	setTick(newTick) {
		this.tick = newTick;

		for (let interval of this.intervals) {
			interval.reset();
		}
	}

	getTick() {
		return this.tick;
	}

	update(main) {
		//if (!this.paused) {
			this.delayCounter.update();

			let delayed = false;
			let delays = this.delays;

			for (var i = 0; i < delays.length; i++) {
				let delay = delays[i];
				if (!delay.complete())
					delayed = true;
				else if (delay.delete()) {
					delays.splice(i, 1);
				}
			}

			if (delayed)
				return false;

			if (!this.parent) {
				super.update();
			} else {
				this.tick = this.parent.tick;
				this.time = this.parent.time;
			}

			for (let tetherable of this.tetherables) {
				tetherable.tick = this.tick;
				tetherable.time = this.time;
			}

			for (let interval of this.intervals) {
				interval.update();
			}

			return main();
		//}
		//return false;
	}
}