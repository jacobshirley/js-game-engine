import UpdateQueue from "../update-queue.js";
import BasicIterator from "../iteration.js";

export default class StreamUpdateQueue extends UpdateQueue {
	constructor(local, clients) {
		super();

		this.local = local;
		this.clients = clients;

		this.toBeFramed = [];
	}

	get isHost() {
		return this.local.host();
	}

	push(update, networked) {
		this.local.push(update, networked);
	}

	pushFramed(update, networked) {
		this.local.pushFramed(update, networked);
	}

	update(frame) {
	}
}
