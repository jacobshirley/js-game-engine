export default class UpdateQueue {
	constructor() {
		this.processors = [];
		this.streams = [];

		this.processedUpdates = 0;
	}

	addStream(stream) {
		this.streams.push(stream);
	}

	removeStream(stream) {
		this.streams.splice(this.streams.indexOf(stream), 1);
	}

	addProcessor(processor) {
		this.processors.push(processor);
	}

	removeProcessor(processor) {
		this.processors.splice(this.processors.indexOf(processor), 1);
	}
}
