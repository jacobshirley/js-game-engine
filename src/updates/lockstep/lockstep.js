import UpdateStream from "../stream.js";
import UpdateQueue from "../update-queue.js";
import LockstepQueueError from "./lockstep-queue-error.js";
import {ClientList} from "../client.js";
import {LocalClientUpdateStream, ClientUpdateStream, ClientsStreamManager} from "../lockstep/client-stream.js";
import BasicIterator from "../iteration.js";

const SERVER_ID = 0;

class MultiStreamUpdateQueue extends UpdateQueue {
	constructor(connection) {
		super();

		this.connection = connection;
		this.clients = new ClientsStreamManager(connection);
		this.addProcessor(this.clients);

		this.toBeFramed = [];
	}

	get local() {
		return this.clients.local;
	}

	get id() {
		return this.local.id();
	}

	get isHost() {
		return this.local.host();
	}

	get isConnected() {
		return this.clients.connected;
	}

	push(update) {
		this.local.push(update);
	}

	pushFramed(update) {
		this.toBeFramed.push(update);
	}

	flush() {
		this.local.flush();
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

export default class LockstepUpdateQueue extends MultiStreamUpdateQueue {
	constructor(connection) {
		super(connection);

		this.updates = new UpdateStream();
	}

	queueUpdates(frame) {
		let applied = [];

		//process host first

		let stream = this.clients.host();
		let it = stream.iterator();

		while (it.hasNext()) {
			let u = it.next();

			if (u.frame == frame) {
				it.remove();

				if (u.name == "APPLY") {
					let data = u.updateMeta;
					for (let d of data) {
						let cl = this.clients.list.get(d.id);
						cl.toBeRead = d.count;
					}
				}

				this.updates.push(u);
			} else if (u.frame < frame) {
				//console.log("frame behind "+u.frame+", "+frame+": "+u.name);
				it.remove();
			} else if (!u.frame) {
				it.remove();

				if (!this.isHost && u.name == "HOST_TICK") {
					let diff = u.tick - frame;
					if (diff < LATENCY) {
						this.updates.push(u);
						throw new LockstepQueueError(diff);
					}
				}

				this.updates.push(u);
			}
		}

		//every other stream
		let clients = this.clients.iterator();
		while (clients.hasNext()) {
			stream = clients.remove();
			if (stream.id != SERVER_ID && !stream.host()) {
				let it = stream.iterator();

				if (this.isHost) {
					let i = 0;
					let updated = it.hasNext();
					while (it.hasNext()) {
						let u = it.remove();
						this.updates.push(u);
						i++;
					}

					if (updated) {
						applied.push({id: stream.id, count: i});
					}
				} else {
					while (stream.toBeRead-- > 0 && it.hasNext()) {
						let u = it.remove();
						this.updates.push(u);
					}

					if (stream.toBeRead > 0) {
						throw new LockstepQueueError(-1);
					}
				}
			}
		}

		if (this.isHost && applied.length > 0) {
			this.local.push({name: "APPLY", frame, updateMeta: applied});
		}
	}

	handleUpdates(frame) {
		let it = this.updates.iterator();
		while (it.hasNext()) {
			let u = it.remove();

			for (let processor of this.processors) {
		    	processor.process(u);
		    }

			this.processedUpdates++;
		}
	}

	update(frame) {
		super.update();

		let cl = this.clients.get(SERVER_ID);
		if (cl != null) {
			let jsonUpdater = cl.iterator();

			while (jsonUpdater.hasNext()) {
				let u = jsonUpdater.remove();

				for (let processor of this.processors) {
			    	processor.process(u);
			    }
			}
		}

		if (!this.isConnected)
			return;

		this.queueUpdates(frame);
		this.handleUpdates(frame);
	}
}
