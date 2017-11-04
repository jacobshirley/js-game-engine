class Delay extends EventEmitter {
	constructor() {
		super();
	}

	delete() {
		return true;
	}

	start(counter) {}

	complete(counter) {}
}

class IncDelay extends Delay{
	constructor(delay, useTicks) {
		super();

		this.delay = delay;
		this.useTicks = useTicks;

		this.marker = 0;
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

class MaxFrameDelay extends Delay{
	constructor(frameInterval) {
		super();

		this.frameInterval = frameInterval;
	}

	delete() {
		return false;
	}

	start() {
		this.then = counter.time;
	}

	complete() {
		let now = counter.time;
		let delta = now - this.then;

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
	}

	reset(counter) {
		this.inc = 0;
	}

	update(counter) {
		let i = counter.deltaTime;
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

class Timer extends Counter {
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
		return Date.now();
	}

	reset() {
		this.tick = 0;
		this.delays = [];
		this.intervals = [];
	}

	addDelay(delay) {
		delay.start(this.delayCounter);

		this.delays.push(delay);
	}

	addInterval(interval) {
		interval.reset(this);

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

	setTick(newTick) {
		this.tick = newTick;

		for (let interval of this.intervals) {
			interval.reset(this);
		}
	}

	getTick() {
		return this.tick;
	}

	update(main) {
		if (!this.paused) {
			this.delayCounter.update(this);

			let delayed = false;
			let delays = this.delays;

			for (var i = 0; i < delays.length; i++) {
				let delay = delays[i];
				if (!delay.complete(this.delayCounter))
					delayed = true;
				else if (delay.delete()) {
					delays.splice(i, 1);
				}
			}

			if (delayed) {
				return false;
			}

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
				interval.update(this);
			}

			if (main)
				return main();
		}

		return false;
	}
}

class LockstepTimer extends Timer {
	constructor(client, delay, maxDelay = 50, syncInterval = 5) {
		super();

		this.client = client;
		this.delay = delay;
		this.maxDelay = maxDelay;
		this.syncInterval = syncInterval;

		let interval = new Interval(syncInterval, true);

		interval.on('complete', () => {
			if (this.client.isHost)
				this.client.push({name: "HOST_TICK", tick: this.tick, time: this.time});
		});

		this.addInterval(interval);
	}

	update(main) {
		try {
			return super.update(main);
		} catch (e) {
			if (e instanceof LockstepQueueError) {
				console.log("Delaying");
				this.addDelay(new IncDelay(this.delay, true));
			} else throw e;
		}
	}

	process(update) {
		if (update.name == "HOST_TICK") {
			if (update.tick - this.tick > this.maxDelay) {
				this.tick = update.tick - 1;
				this.time = update.time;

				this.addDelay(new IncDelay(this.delay, true));
			}
		}
	}
}

class RenderTimer extends Timer {
	constructor() {
		super();
		this.delay = null;
	}

	setMaxFrames(max) {
		let delay = new MaxFrameDelay(1000.0/max);
		if (this.delay == null) {
			this.delay = delay;
			this.addDelay(this.delay);
		}
	}

	render() {}
}

class GameTimer extends RenderTimer {
	constructor(timer, renderFunc, logicFunc) {
		super();

		this.renderFunc = renderFunc;
		this.logicFunc = logicFunc;

        this.updateInterval = DEFAULT_UPDATE_RATE;
        this.updateTimer = timer || new Timer();

        this.renderTime = 0;
        this.updateTime = 0;
        this.fps = 0;
        this.tempFPS = 0;

        this.ups = 0;
        this.tempUPS = 0;
    }

	setRenderFunction(func) {
		this.renderFunc = func;
	}

	setLogicFunction(func) {
		this.logicFunc = func;
	}

	setUpdateRate(updateRate) {
        this.updateInterval = 1000 / updateRate;
    }

	getDebugString() {
        return "Tick: "+this.updateTimer.tick+"<br /> Time (ms): "+this.updateTimer.time+"<br /> FPS: "+this.fps+"<br /> UPS: "+this.ups;
    }

	update() {
		let t = 0;

		while (this.updateTime >= this.updateInterval && t < 20) { // < 7 so it can catch up and doesn't go crazy
			if (!this.updateTimer.update(() => {
				this.logicFunc(this.updateTimer.tick);

				t++;

				this.updateTime -= this.updateInterval;
				this.tempUPS++;

				return true;
			})) {
				this.updateTime -= this.updateInterval;
			}
		}
	}

	render() {
		return super.update(() => {
            this.update();
			this.renderFunc();

            this.renderTime += this.deltaTime;
            this.updateTime += this.deltaTime;
            this.tempFPS++;

            if (this.renderTime >= 1000) {
                this.fps = this.tempFPS;
                this.ups = this.tempUPS;

                this.renderTime = 0;
                this.tempFPS = 0;
                this.tempUPS = 0;
            }

            return true;
        });
	}
}
