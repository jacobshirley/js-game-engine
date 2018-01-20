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
}

export class BasicUpdateQueue extends UpdateQueue {

}
