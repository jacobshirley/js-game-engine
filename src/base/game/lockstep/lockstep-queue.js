import UpdateStream from "../../engine/updates/stream.js";
import StreamUpdateQueue from "../../engine/updates/stream-update-queue.js";
import LockstepQueueError from "./lockstep-queue-error.js";
import EventEmitter from "../../shims/events.js";

const LATENCY = 2;

export default class LockstepUpdateQueue extends StreamUpdateQueue {
	constructor(local, clients) {
		super(local, clients);

		this.updates = new UpdateStream();
		this.controlServerID = -1;
	}

	setControlServer(id) {
		this.controlServerID = id;
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
						let cl = this.clients.get(d.id);

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

			if (stream.id() != 0 && !stream.host()) {
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
						applied.push({id: stream.id(), count: i});
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
		let c = 0;
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

		this.queueUpdates(frame);
		this.handleUpdates(frame);
	}
}
