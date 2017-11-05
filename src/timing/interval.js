export default class Interval extends EventEmitter {
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
