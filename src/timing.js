class Timer {
	constructor() {
		this.tick = 0;
		this.delays = [];
	}

	addDelay(delay) {
		delay.timer = this;
		delay.start();

		this.delays.push(delay);
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

		if (delayed)
			return false;

		return main();
	}
}