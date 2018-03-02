function currentTime() {
	return Date.now();
}

export default class Counter {
	constructor() {
		this._oldTime = 0;
		this.time = 0;
		this.tick = 0;
		this.deltaTime = 0;
		this.maxDeltaTime = -1;
	}

	setMaxDeltaTime(maxDeltaTime) {
		this.maxDeltaTime = maxDeltaTime;
	}

	update() {
		this.tick++;

		if (this.tick == 1) {
			this._oldTime = currentTime();
		}

		let curTime = currentTime();
		this.deltaTime = curTime - this._oldTime;

		if (this.maxDeltaTime != -1) {
			this.deltaTime = Math.min(this.deltaTime, this.maxDeltaTime);
		}

		this._oldTime = curTime;

		this.time += this.deltaTime;
	}
}
