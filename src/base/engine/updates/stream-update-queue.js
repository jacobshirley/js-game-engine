import UpdateQueue from "./update-queue.js";
import BasicIterator from "./iteration.js";

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

	push(update) {
		this.local.push(update);
	}

	pushFramed(update) {
		this.toBeFramed.push(update);
	}

	recv() {
		let clients = this.clients.iterator();

		while (clients.hasNext()) {
			clients.remove().recv();
		}
	}

	update(frame) {
		let it = new BasicIterator(this.toBeFramed, false);
		while (it.hasNext()) {
			let u = it.remove();
			u.frame = frame;
			this.local.push(u);
		}
		this.recv();
	}
}
