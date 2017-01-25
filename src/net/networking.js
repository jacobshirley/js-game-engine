let SERVER_ID = 0;

class UpdateProcessor {
	constructor(networking) {
		this.networking = networking;
	}

	preprocess() {

	}

	startProcess(clientId) {

	}

	process(update) {

	}

	endProcess(clientId) {
		
	}

	postprocess() {

	}

	encode(update) {

	}

	decode(update) {

	}
}

class ConnectionUpdateProcessor extends UpdateProcessor {
	constructor(networking) {
		super(networking);
		this.initialised = false;
	}

	process(update) {
		let networking = this.networking;

        if (update.name == "CONNECTED") {
        	for (let client of update.clients) {
        		networking.addClient(client);
        	}
        	if (!this.initialised) {
	        	this.initialised = true;

	            networking.isHost = update.isHost;
	            networking.id = update.id;
	            networking.connectionHandler.id = update.id;
	        }

            return Networking.CONTINUE_DELETE;
        } else if (update.name == "DISCONNECTED") {
        	for (let client of update.clients) {
        		networking.removeClient(client);
        	}
        } else if (!this.initialised)
			return Networking.CONTINUE_DELETE;

        return Networking.SKIP;
	}
}

//Connection - does the connecting to server, sends data

class ClientData {
	constructor(id) {
		this.id = id;
		this.updateData = [];
	}
}

class Connection extends EventEmitter {
	constructor() {
		super();
		this.connected = false;
	}

	get isConnected() {
		return this.connected;
	}

	send(data) {}
}

class WebSocketConnection extends Connection {
	constructor(ip) {
		super();

		this.ip = ip;
		this.ws = new WebSocket(ip);

		this.ws.onopen = () => {
			this.connected = true;
			this.emit('connected');
		}

		this.ws.onclose = () => {
			this.connected = false;
			this.emit('disconnected');
		}

		this.ws.onerror = (ev) => {
			this.emit('error', ev);
		}

		this.ws.onmessage = (ev) => {
			this.emit('message', JSON.parse(ev.data));
		}
	}

	send(data) {
		if (this.connected)
			this.ws.send(JSON.stringify(data));
	}
}

class LocalServer {
	constructor() {
		this.clients = [];
	}
}

class LocalConnection extends Connection {
	constructor(latency, packetLossChance) {
		super();

		this.connected = true;

		this.latency = latency;
		this.packetLossChance = packetLossChance;

		this.data = [];
		this.data.push({from: SERVER_ID, data: {name: "CONNECTED", isHost: true, clients: [1], id: 1}});

		setInterval(() => {
			if (Math.random() > this.packetLossChance) {
				this.emit('message', this.data);
			}
			this.data = [];
		}, this.latency);
	}

	send(data) {
		this.data = this.data.concat({from: 1, data: data});
	}
}

class ConnectionHandler {
	constructor(connection, maxConnections) {
		this.connection = connection;

		this.id = -1;

		this.maxConnections = maxConnections;
		this.clientData = [];
		this.internalClientData = [];
		this.clientDataIndices = [SERVER_ID];

		this.localUpdates = [];

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updateData = data[i];
				let internalClientData = this.internalClientData[updateData.from];

				internalClientData.updateData = internalClientData.updateData.concat(updateData.data);
			}
		});
	}

	init() {
		this.clientData = [];
		this.internalClientData = [];
		this.clientDataIndices = [SERVER_ID];

		for (let i = -1; i < this.maxConnections; i++) {
			this.clientData.push(new ClientData(-1));
			this.internalClientData.push(new ClientData(-1));
		}
	}

	clientExists(id) {
		return id == SERVER_ID || this.clientData[id].id != -1;
	}

	getClientData(id) {
		return this.clientData[id];
	}

	addClient(id) {
		if (!this.clientExists(id)) {
			this.clientData[id].id = id;
			this.internalClientData[id].id = id;

			this.clientDataIndices.push(id);
		}
	}

	removeClient(id) {
		this.clientData[id] = new ClientData(-1);
		this.internalClientData[id] = new ClientData(-1);

		this.clientDataIndices.splice(this.clientDataIndices.indexOf(id), 1);
	}

	recv() {
		let clientDataIndices = this.clientDataIndices;
		let clientData = this.clientData;
		let internalClientData = this.internalClientData;
		
		for (let i = 0; i < clientDataIndices.length; i++) {
			let index = clientDataIndices[i];

			let toBeRemovedFrom = internalClientData[index];
			let toBeAddedTo = clientData[index];

			toBeAddedTo.updateData = toBeAddedTo.updateData.concat(toBeRemovedFrom.updateData.splice(0));
		}

		return clientData;
	}

	queue(update) {
		this.localUpdates.push(update);
	}

	flush() {
		if (this.localUpdates.length > 0) {
			let updates = this.localUpdates.splice(0);

			this.connection.send(updates);
		}
	}
}

class JSONUpdateIterator {
	constructor(updateData, copy) {
		this.updateData = updateData;
		if (copy)
			this.updateData = [].concat(updateData);
	}

	hasNext() {
		return this.updateData.length > 0;
	}

	next() {
		return this.updateData[0];
	}

	shift() {
		return this.updateData.shift();
	}
}

class ProtobufUpdateIterator {
	constructor(updateData) {
		this.updateData = updateData;
	}
}

class UpdateProcessorStream {
	constructor(updateIterator, updaters) {
		this.updateIterator = updateIterator;
		this.updaters = updaters;
		this.processed = 0;
	}

	iterate() {
		let last = null;
	    while (true) {
	        let update = this.updateIterator.next();

	        if (last != null) { //debug code
	        	if (last == update) {
	        		//console.log("Problem with "+update.name+", "+this.updaters[1].process(update));
	        		//break;
	        	}
	        }

	        let state = -1;
	        for (let processor of this.updaters) {
	        	let state2 = processor.process(update);

	        	if (state == -1) {
	        		if (!state2)
	        			console.log("WARNING: "+(typeof processor)+" returns no value. Defaulting to Networking.SKIP for this update...");

	        		state = state2 || Networking.SKIP;
	        	} else if (state == Networking.SKIP && state2 != state) {
	        		state = state2;
	        	} else if (state == Networking.CONTINUE_DELETE && (state2 == Networking.BREAK_DELETE || state2 == Networking.BREAK_NOTHING)) {
	        		throw "Processor conflict with update "+update.name+": CONTINUE_DELETE and BREAK_* are incompatible. Please check your updaters.";
	        	} else if (state == Networking.BREAK_NOTHING && state2 == Networking.BREAK_DELETE) {
	        		state = state2;
	        	}
	        }

	        console.log(state);

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

class Networking extends Timer {

	static get BREAK_DELETE() {
      return 0;
    }
    static get BREAK_NOTHING() {
      return 1;
    }
    static get CONTINUE_DELETE() {
      return 2;
    }
    static get SKIP() {
      return 3;
    }

	constructor(client, maxConnections) {
		super();

		this.connection = client;

		this.id = -1;
		this.isHost = false;

		this.connectionHandler = new ConnectionHandler(this.connection, maxConnections);

		this.updateProcessors = [];

		this.processedUpdates = 0;

		this.init();
	}

	init() {
		this.connectionHandler.init();

		this.addUpdateProcessor(new ConnectionUpdateProcessor(this));
	}

	addUpdate(update) {
		for (let processor of this.updateProcessors) {
			processor.encode(update);
		}

		if (this.id != -1) {
			let clientData = this.connectionHandler.getClientData(this.id);
			clientData.updateData.push(update);
		}

		this.connectionHandler.queue(update);
	}

	addClient(id) {
		this.connectionHandler.addClient(id);
	}

	removeClient(clientId) {
		this.connectionHandler.removeClient(id);
	}

	addUpdateProcessor(processor) {
		processor.networking = this;

		this.updateProcessors.push(processor);
	}

	removeUpdateProcessor(processor) {
		this.updateProcessors.splice(this.updateProcessors.indexOf(processor), 1);
	}

	sendUpdates() {
		this.connectionHandler.flush();
	}

	process(id, updaters) {
        let updateCache = this.connectionHandler.getClientData(id).updateData;

        for (let processor of updaters) {
	    	processor.startProcess(id);
	    }

        if (updateCache.length > 0) {
        	let ups = new UpdateProcessorStream(new JSONUpdateIterator(updateCache, false), updaters);
        	ups.iterate();
        	this.processedUpdates += ups.processed;
        }

        for (let processor of updaters) {
	    	processor.endProcess(id);
	    }
	}

	processLocalUpdates() {
		this.process(this.id, this.updateProcessors);
	}

	processAll() {
		let clientDataIndices = this.connectionHandler.clientDataIndices;

	    for (let processor of this.updateProcessors) {
	    	processor.preprocess();
	    }

	    for (let i = 0; i < clientDataIndices.length; i++) {
	    	let id = clientDataIndices[i];

	        this.process(id, this.updateProcessors);
	    }

	    for (let processor of this.updateProcessors) {
	    	processor.postprocess();
	    }
	}

	update() {
		return super.update(() => {
			this.connectionHandler.recv();

			return true;
		});
	}
}