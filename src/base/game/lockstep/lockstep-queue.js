import UpdateStream from "../../engine/updates/streamed/stream.js";
import StreamUpdateQueue from "../../engine/updates/streamed/stream-update-queue.js";
import LockstepQueueError from "./lockstep-queue-error.js";
import EventEmitter from "../../shims/events.js";

const LATENCY = 20;

export default class LockstepUpdateQueue extends StreamUpdateQueue {
	constructor(local, clients) {
		super(local, clients);

		this.updates = [];
		this.controlServerID = -1;
	}

	setControlServer(id) {
		this.controlServerID = id;
	}

	queueLocalUpdates() {
		this.updates = this.updates.concat(this.local.localUpdates.splice(0));
	}

	queueUpdates(frame) {
		let applied = [];

		//process host first

		let stream = this.clients.host();
		let it = stream.iterator();

		while (it.hasNext()) {
			let u = it.next();

			u.__clId = stream.id();
			if (u.frame == frame) {

				it.remove();

				if (u.name == "APPLY") {
					let data = u.updateMeta;
					for (let d of data) {
						let cl = this.clients.get(d.id);

						cl.toBeRead = d.count;
						//console.log(u);
					}
				}

				this.updates.push(u);
			} else if (u.frame < frame) {
				//console.log("frame behind: "+u.frame+" < "+frame+": "+u.name);
				it.remove();
			} else if (!u.frame) {
				it.remove();

				/*if (!this.isHost && u.name == "HOST_TICK") {
					let diff = u.tick - frame;
					if (diff < LATENCY) {
						console.log(u);
						console.log(diff+", "+u.tick+", "+frame);
						//this.updates.push(u);
						console.log("LATENCY ERROR");
						throw new LockstepQueueError(diff);
					} else {
						//this.updates.push(u);
					}
				}*/

				this.updates.push(u);
			}
		}

		//every other stream
		let clients = this.clients.iterator();

		while (clients.hasNext()) {
			stream = clients.remove();

			if (!stream.host()) {
				let it = stream.iterator();

				if (this.isHost) {
					let i = 0;
					let updated = it.hasNext();

					while (it.hasNext()) {
						let u = it.remove();
						u.__clId = stream.id();
						this.updates.push(u);
						i++;
					}

					if (updated) {
						//console.log("applied "+i+ " on frame "+frame);

						applied.push({id: stream.id(), count: i});
					}
				} else {
					if (stream.toBeRead > 0) {
						//console.log("applied "+stream.toBeRead+" on frame "+frame);
						while (stream.toBeRead-- > 0 && it.hasNext()) {
							let u = it.remove();
							u.__clId = stream.id();

							this.updates.push(u);
						}

						if (stream.toBeRead > 0) {
							console.log("stream need to read "+stream.toBeRead);
							//console.log(stream);
							throw new LockstepQueueError(-1);
						}
					}
				}
			}
		}

		if (this.isHost && applied.length > 0) {
			this.local.push({name: "APPLY", frame, updateMeta: applied}, true);
		}
	}

	handleUpdates(frame) {
		while (this.updates.length > 0) {
			let u = this.updates.shift();

			for (let processor of this.processors) {
		    	processor.process(u);
		    }

			this.processedUpdates++;
		}
	}

	update(frame) {
		super.update();

		this.queueLocalUpdates(frame);
		this.queueUpdates(frame);
		this.handleUpdates(frame);
	}
}