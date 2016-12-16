class Delay extends EventEmitter{
	constructor(delay, useTicks) {
		super();

		this.timer = null;

		this.delay = delay;
		this.useTicks = useTicks;

		this.marker = 0;
	}

	start() {
		if (!this.timer)
			return;

		let i = this.timer.delayTick;
		if (!this.useTicks)
			i = this.timer.delayTime;

		this.marker = i + this.delay;
	}

	complete() {
		if (!this.timer)
			return false;

		let i = this.timer.delayTick;
		if (!this.useTicks)
			i = this.timer.delayTime;
		
		let bool = i >= this.marker;
		if (bool) {
			this.emit('complete');
		} else {
			this.emit('delay');
		}
		return bool;
	}
}

class Interval extends EventEmitter {
	constructor(target, useTicks) {
		super();

		this.target = target;
		this.inc = 0;
		this.useTicks = useTicks;
		this.timer = null;
	}

	reset() {
		this.inc = 0;
	}

	update() {
		let i = this.timer.deltaTime;
		if (this.useTicks)
			i = 1;

		//console.log(this.inc);
		this.inc += i;
		if (this.inc >= this.target) {
			this.emit('complete');
			this.reset();
		}
	}
}

class Timer {
	constructor() {
		this.tick = 0;
		this.time = 0;
		this.oldTime = 0;
		this.deltaTime = 0;

		this.delayTick = 0;
		this.delayTime = 0;
		this.delays = [];

		this.intervals = [];

		this.parent = null;
		this.tetherables = [];

		this.maxUpdates = 0;
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
		interval.timer = this;
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

	setMaxUpdates(max) {
		this.maxUpdates = max;
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
		let curTime = Timer.currentTime;

		if (this.oldTime == 0) {
			this.oldTime = curTime;
		}
		this.deltaTime = curTime-this.oldTime;

		if (!this.parent) {
			this.tick++;
			this.time += this.deltaTime;
		} else {
			this.tick = this.parent.tick;
			this.time = this.parent.time;
		}

		this.oldTime += this.deltaTime;

		for (let tetherable of this.tetherables) {
			tetherable.tick = this.tick;
			tetherable.time = this.time;
		}

		let delayed = false;
		let c = 0;

		if (this.delays.length > 0) {
			this.delayTick++;
			this.delayTime += this.deltaTime;
		}

		for (let delay of this.delays) {
			if (!delay.complete())
				delayed = true;
			else {
				this.delays.splice(c, 1);
			}
			c++;
		}

		for (let interval of this.intervals) {
			interval.update();
		}

		if (delayed) {
			return false;
		}

		return main();
	}
}