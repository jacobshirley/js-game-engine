class UpdateStream {
	constructor(id) {
		this.id = id;
		this.updates = [];
	}

	push(update) {
		this.updates.push(update);
	}

	hasNext() {
		return this.updates.length > 0;
	}

	next() {
		return this.updates[0];
	}

	remove() {
		return this.updates.shift();
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

class UpdatePool {
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

class NetworkedUpdateQueue extends UpdatePool {
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
		this.recv();

		let serverUpdates = this.getClient(SERVER_ID).updates;
		let jsonUpdater = new JSONUpdateIterator(serverUpdates);

		while (jsonUpdater.hasNext()) {
			let u = jsonUpdater.shift();
			this.process(u);
			for (let processor of this.processors) {
		    	processor.startProcess(u.clientId);
		    	processor.process(u);
		    	processor.endProcess(u.clientId);
		    }
		}
	}
}

class LockstepUpdater extends UpdateProcessor {
	constructor(pool) {
		super(pool);
	}

	process(update) {
		console.log(update.frame);
	}
}

class LockstepUpdateQueue extends NetworkedUpdateQueue {
	constructor(connection) {
		super(connection);

		this.readingClients = [];
	}

	addClient(id, isHost) {
		let cl = super.addClient(id, isHost);
		this.readingClients.push(0);
		return cl;
	}

	update(frame) {
		super.update();

		if (!this.connected)
			return;

		let updates = [];
		let applied = [];

		//process host first
		for (let stream of this.streams) {
			if (stream.isHost) {
				let it = new JSONUpdateIterator(stream.updates);

				while (it.hasNext()) {
					let u = it.next();

					if (u.frame == frame) {
						it.shift();

						if (u.name == "APPLY") {
							let data = u.updateMeta;
							for (let d of data) {
								let index = this.streamIds.indexOf(d.id);
								this.readingClients[index] = d.count;
							}
						} else {
							updates.push(u);
						}
					} else if (u.frame < frame) {
						it.shift();
					} else if (!u.frame) {
						updates.push(u);
						it.shift();
					}
				}

				break;
			}
		}

		//every other stream
		for (let stream of this.streams) {
			if (stream.id != SERVER_ID && !stream.isHost) {
				let it = new JSONUpdateIterator(stream.updates);
				let i = 0;
				if (this.isHost) {
					let updated = it.hasNext();
					while (it.hasNext()) {
						let u = it.shift();
						updates.push(u);
						i++;
					}

					if (updated) {
						applied.push({id: stream.id, count: i});
					}
				} else {
					let index = this.streamIds.indexOf(stream.id);
					while (this.readingClients[index] > 0 && it.hasNext()) {
						let u = it.shift();
						updates.push(u);

						this.readingClients[index]--;
					}
				}
			}
		}

		if (this.isHost && applied.length > 0) {
			this.push({name: "APPLY", frame, updateMeta: applied});
		}

		for (let u of updates) {
			for (let processor of this.processors) {
		    	processor.startProcess(u.clientId);
		    	processor.process(u);
		    	processor.endProcess(u.clientId);
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
				let delay = new IncDelay(100, false);
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
		} else if (update.name == "SERVER_TICK") {
			if (!this.pool.isHost && update.time - this.world.updateTimer < 300) {
				console.log("WAIT");
				timer.addDelay(new IncDelay(500, false));
			}
		}

		return super.process(update);
	}
}

class JSONUpdateIterator {
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

	shift() {
		this.index--;
		if (this.index <= 0) {
			this.index = 0;
			return this.updateData.shift();
		}
		return this.updateData.splice(this.index, 1);
	}
}

class UpdateProcessorStream {
	constructor(updateIterator, processors) {
		this.updateIterator = updateIterator;
		this.processors = processors;
		this.processed = 0;
	}

	iterate() {
		let last = null;
	    while (true) {
	        let update = this.updateIterator.next();

	        if (last != null) { //debug code
	        	if (last == update) {
	        		//console.log("Problem with "+update.name+", "+this.processors[1].process(update));
	        		//break;
	        	}
	        }

	        let state = -1;
	        for (let processor of this.processors) {
	        	let state2 = processor.process(update);

	        	if (state == -1) {
	        		if (!state2)
	        			console.log("WARNING: "+(typeof processor)+" returns no value. Defaulting to Networking.SKIP for this update...");

	        		state = state2 || Networking.SKIP;
	        	} else if (state == Networking.SKIP && state2 != state) {
	        		state = state2;
	        	} else if (state == Networking.CONTINUE_DELETE && (state2 == Networking.BREAK_DELETE || state2 == Networking.BREAK_NOTHING)) {
	        		throw "Processor conflict with update "+update.name+": CONTINUE_DELETE and BREAK_* are incompatible. Please check your processors.";
	        	} else if (state == Networking.BREAK_NOTHING && state2 == Networking.BREAK_DELETE) {
	        		state = state2;
	        	}
	        }

	        if (state == Networking.BREAK_DELETE || state == Networking.CONTINUE_DELETE) {
	        	this.updateIterator.shift();
	        	this.processed++;
	        }

	        if (state == Networking.BREAK_DELETE || state == Networking.BREAK_NOTHING)
	        	break;

	        last = update;

	        if (!this.updateIterator.hasNext())
	            break;
	    }
	}
}
