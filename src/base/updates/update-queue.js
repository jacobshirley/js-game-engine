export default class UpdateQueue {
	constructor() {
		this.processors = [];

		this.processedUpdates = 0;
	}

	addProcessor(processor) {
		this.processors.push(processor);
	}

	removeProcessor(processor) {
		this.processors.splice(this.processors.indexOf(processor), 1);
	}

	push(update) {}

	pushFramed(update) {}

	update(frame) {}
}

export class BasicUpdateQueue extends UpdateQueue {
	constructor() {
		super();

		this.updates = [];
		this.toBeFramed = [];
	}

	push(update) {
		this.updates.push(update);
	}

	pushFramed(update) {
		this.toBeFramed.push(update);
	}

	update(frame) {
		let it = new BasicIterator(this.toBeFramed, false);
		while (it.hasNext()) {
			let u = it.remove();
			u.frame = frame;
			this.updates.push(u);
		}

		it = new BasicIterator(this.updates, false);
		while (it.hasNext()) {
			let u = it.remove();

			for (let p of this.processors) {
				p.process(u);
			}

			this.processedUpdates++;
		}
	}
}
