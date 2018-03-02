import Timer from "./timer.js";
import Delay from "./delay.js";

export default class RenderTimer extends Timer {
	constructor() {
		super();
		this.delay = null;
	}

	setMaxFrames(max) {
		let delay = new MaxFrameDelay(1000.0 / max);
		if (this.delay == null) {
			this.delay = delay;
			this.addDelay(this.delay);
		}
	}

	render() {}
}

class MaxFrameDelay extends Delay {
	constructor(frameInterval) {
		super();

		this.frameInterval = frameInterval;
	}

	delete() {
		return false;
	}

	start(counter) {
		this.then = counter.time;
	}

	complete(counter) {
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
