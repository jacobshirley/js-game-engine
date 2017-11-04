const LATENCY = 5;

class UpdateStream {
	constructor(id) {
		this.id = id;
		this.updates = [];
	}

	push(update) {
		this.updates.push(update);
	}

	iterator() {
		return new BasicIterator(this.updates);
	}
}

class ClientUpdateStream extends UpdateStream {
	constructor(id, isHost) {
		super(id);

		this.isHost = isHost;
		this.cachedUpdates = [];
	}

	recv() {
		this.updates = this.updates.concat(this.cachedUpdates.splice(0));
	}
}

class LocalClientUpdateStream extends ClientUpdateStream {
	constructor(id, isHost) {
		super(id, isHost);

		this.localUpdates = [];
	}

	push(update) {
		super.push(update);

		this.localUpdates.push(update);
	}
}

class UpdateQueue {
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

class DelegateUpdater extends UpdateProcessor {
	constructor(pool, delegate) {
		super(pool);

		this.delegate = delegate;
	}

	setDelegate(delegate) {

		this.delegate = delegate;
	}

	preprocess() {
		if (this.delegate)
			this.delegate.preprocess();
	}

	startProcess(id) {
		if (this.delegate)
			this.delegate.startProcess(id);
	}

	process(update) {
		if (this.delegate)
			this.delegate.process(update);
	}

	endProcess(id) {
		if (this.delegate)
			this.delegate.endProcess(id);
	}

	postprocess() {
		if (this.delegate)
			this.delegate.postprocess();
	}
}

class NetworkedUpdateQueue extends UpdateQueue {
	constructor(connection) {
		super();

		this.connection = connection;
		this.connected = false;

		this.streamIds = [];

		this.myClient = new LocalClientUpdateStream(-1, true);

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updates = data[i];

				let client = this.getClient(updates.from);
				if (!client)
					client = this.addClient(updates.from, false);

				client.cachedUpdates = client.cachedUpdates.concat(updates.data);
			}
		});
	}

	process(update) {
		if (update.name == "CONNECTED") {
			if (!this.connected) {
				this.connected = true;

				this.myClient.id = update.id;
				this.myClient.isHost = update.isHost;

				this.setClient(update.id, this.myClient);
			}

			for (let cl of update.clients) {
				this.addClient(cl.id, cl.isHost);
			}
		} else if (update.name == "DISCONNECTED") {
			for (let id of update.clients) {
				this.removeClient(id);
			}
		}
	}

	get id() {
		return this.myClient.id;
	}

	get isHost() {
		return this.myClient.isHost;
	}

	clientExists(id) {
		return this.streamIds.indexOf(id) != -1;
	}

	getClient(id) {
		return this.streams[this.streamIds.indexOf(id)];
	}

	addClient(id, isHost) {
		if (!this.clientExists(id)) {
			this.streamIds.push(id);

			this.addStream(new ClientUpdateStream(id, isHost));
		} else {
			let cl = this.getClient(id);
			cl.isHost = isHost;
			this.setClient(id, cl);
			return cl;
		}

		return this.getClient(id);
	}

	setClient(id, client) {
		if (this.clientExists(id)) {
			this.streams[this.streamIds.indexOf(id)] = client;
		} else {
			this.streamIds.push(id);

			this.addStream(client);
		}

		return client;
	}

	removeClient(id) {
		let index = this.streamIds.indexOf(id);

		this.removeStream(this.streams[index]);
		this.streamIds.splice(index, 1);
	}

	recv() {
		let clientIds = this.streamIds;
		let clients = this.streams;

		for (let i = 0; i < clientIds.length; i++) {
			let client = clients[i];

			client.recv();
		}
	}

	push(update) {
		if (this.myClient != null)
			this.myClient.push(update);
	}

	broadcast(update) {
		for (let st of this.streams)
			st.push(update);
	}

	flush() {
		if (this.myClient != null) {
			let updates = this.myClient.localUpdates;

			if (updates.length > 0) {
				this.connection.send(updates.splice(0));
			}
		}
	}

	update() {
		for (let processor of this.processors) {
			processor.encode()
		}

		this.recv();

		let cl = this.getClient(SERVER_ID);
		if (cl != null) {
			let jsonUpdater = cl.iterator();

			while (jsonUpdater.hasNext()) {
				let u = jsonUpdater.remove();
				this.process(u);
				for (let processor of this.processors) {
			    	//processor.startProcess(u.clientId);
			    	processor.process(u);
			    	//processor.endProcess(u.clientId);
			    }
			}
		}
	}
}

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
						} else {
							this.queuedUpdates.push(u);
						}
					} else if (u.frame < frame) {
						console.log("DDD");
						it.remove();
					} else if (!u.frame) {
						this.queuedUpdates.push(u);
						it.remove();
					}
				}

				break;
			}
		}

		//every other stream
		for (let stream of this.streams) {
			if (stream.id != SERVER_ID && !stream.isHost) {
				let it = stream.iterator();
				let i = 0;
				if (this.isHost) {
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

		let it = new JSONUpdateIterator(this.queuedUpdates);
		while (it.hasNext()) {
			let u = it.remove();

			for (let processor of this.processors) {
		    	//processor.startProcess(u.clientId);
		    	processor.process(u);
		    	//processor.endProcess(u.clientId);
		    }

			this.processedUpdates++;
		}
	}
}

class WorldUpdater extends DelegateUpdater {
	constructor(queue, delegate, world) {
		super(queue, delegate);
		this.world = world;
	}

	setWorld(world) {
		this.world = world;
	}

	process(update) {
		if (update.name == "INIT") {
			let timer = this.world.updateTimer;

			if (!this.pool.isHost) {
				let delay = new IncDelay(LATENCY, true);
				delay.on('complete', () => {
					timer.setTick(update.startFrame - 1);
					timer.time = update.time;
					this.world.reset(update.props);
				});

				timer.addDelay(delay);
			}
		} else if (update.name == "CONNECTED") {
			if (!this.pool.isHost) {
				this.pool.push({name: "REQ"});
			}
		} else if (update.name == "REQ") {
			if (this.pool.isHost) {
				let timer = this.world.updateTimer;
				let p = this.world.physics.getAllObjectProps();

				this.world.reset(p);
				this.pool.push({name: "INIT", startFrame: timer.tick, time: timer.time, props: p});
			}
		}

		return super.process(update);
	}
}

class BasicIterator {
	constructor(updateData, copy) {
		this.updateData = updateData;
		this.index = 0;
		if (copy)
			this.updateData = [].concat(updateData);
	}

	hasNext() {
		return this.index < this.updateData.length;
	}

	next() {
		return this.updateData[this.index++];
	}

	remove() {
		this.index--;
		if (this.index <= 0) {
			this.index = 0;
			return this.updateData.shift();
		}
		return this.updateData.splice(this.index, 1);
	}
}

class JSONUpdateIterator {
	constructor(updateData, copy) {
		this.updateData = updateData;
		this.index = -1;
		this.blanks = 0;
		if (copy)
			this.updateData = [].concat(updateData);

		let i = 0;
		while (i < this.updateData.length && this.updateData[i++] == null) {
			this.blanks++;
		}
	}

	cleanup() {
		let i = -1;
		while (++i < this.updateData.length && this.updateData[i] == null) {
			if (i == 0) {
				console.log("DDD");
				this.updateData.shift();
				this.blanks--;

				i--;
			}
		}
	}

	hasNext() {
		//this.cleanup();

		return this.index < this.updateData.length - this.blanks - 1;
	}

	next() {
		while (++this.index < this.updateData.length && this.updateData[this.index] == null) {

		}

		//console.log(this.updateData[this.index]);

		return this.updateData[this.index];
	}

	remove() {
		//this.cleanup();

		if (this.index <= 0) {
			let r = this.updateData.shift();
			if (this.index == 0)
				this.index--;

			return r;
		} else {
			let ret = this.updateData[this.index];
			console.log("LOL");
			this.updateData[this.index--] = null;
			this.blanks++;

			return ret;
		}
	}
}
