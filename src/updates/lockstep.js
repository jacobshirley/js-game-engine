class LockstepUpdateQueue extends NetworkedUpdateQueue {
	constructor(connection) {
		super(connection);

		this.queuedUpdates = [];
		this.readingClients = [];
	}

	addClient(id, isHost) {
		if (!this.clientExists(id))
			this.readingClients.push(0);
		return super.addClient(id, isHost);
	}

	update(frame) {
		super.update();

		if (!this.connected)
			return;

		let applied = [];
		//process host first
		for (let stream of this.streams) {
			if (stream.isHost) {
				let it = stream.iterator();

				while (it.hasNext()) {
					let u = it.next();
					if (u.frame == frame) {
						it.remove();

						if (u.name == "APPLY") {
							let data = u.updateMeta;
							for (let d of data) {
								let index = this.streamIds.indexOf(d.id);
								this.readingClients[index] = d.count;
							}
						}

						this.queuedUpdates.push(u);
					} else if (u.frame < frame) {
						console.log("frame behind "+u.frame+", "+frame+": "+u.name);
						it.remove();
					} else if (!u.frame) {
						it.remove();

						if (!this.isHost && u.name == "HOST_TICK") {
							let diff = u.tick - frame;
							if (diff < LATENCY) {
								this.queuedUpdates.push(u);
								throw new LockstepQueueError(diff);
							}
						}

						this.queuedUpdates.push(u);
					}
				}

				break;
			}
		}

		//every other stream
		for (let stream of this.streams) {
			if (stream.id != SERVER_ID && !stream.isHost) {
				let it = stream.iterator();

				if (this.isHost) {
					let i = 0;
					let updated = it.hasNext();
					while (it.hasNext()) {
						let u = it.remove();
						this.queuedUpdates.push(u);
						i++;
					}

					if (updated) {
						applied.push({id: stream.id, count: i});
					}
				} else {
					let index = this.streamIds.indexOf(stream.id);
					while (this.readingClients[index] > 0 && it.hasNext()) {
						let u = it.remove();
						this.queuedUpdates.push(u);
						this.readingClients[index]--;
					}

					if (this.readingClients[index] > 0) {
						throw new LockstepQueueError(-1);
					}
				}
			}
		}

		if (this.isHost && applied.length > 0) {
			this.push({name: "APPLY", frame, updateMeta: applied});
		}

		let it = new BasicIterator(this.queuedUpdates);
		while (it.hasNext()) {
			let u = it.remove();

			for (let processor of this.processors) {
		    	processor.process(u);
		    }

			this.processedUpdates++;
		}
	}
}
