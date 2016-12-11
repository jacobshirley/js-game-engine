let SERVER_INDEX = 0;

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

	modify(update) {

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

	            networking.addUpdate({name: "CONNECTION", id: update.id});
	        }

            return Networking.CONTINUE_DELETE;
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

	isConnected() {
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

class ConnectionHandler {
	constructor(connection, maxConnections) {
		this.connection = connection;

		this.maxConnections = maxConnections;
		this.serverData = [];
		this.internalData = [];
		this.serverDataIndices = [];

		this.localUpdates = [];

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updateData = data[i];
				let internalData = this.internalData[updateData.from];

				internalData.updateData = internalData.updateData.concat(updateData.data);
			}
		});
	}

	init() {
		this.serverData = [];
		this.internalData = [];
		this.serverDataIndices = [SERVER_INDEX];

		for (let i = -1; i < this.maxConnections; i++) {
			this.serverData.push(new ClientData(-1));
			this.internalData.push(new ClientData(-1));
		}
	}

	clientExists(id) {
		return this.serverData[id].id != -1;
	}

	getClient(id) {
		return this.serverData[id];
	}

	addClient(id) {
		if (!this.clientExists(id)) {
			this.serverData[id].id = id;
			this.internalData[id].id = id;

			this.serverDataIndices.push(id);
		}
	}

	removeClient(id) {
		this.serverData[id] = new ClientData(-1);
		this.internalData[id] = new ClientData(-1);

		for (let i = 0; i < this.serverDataIndices.length; i++) {
			if (this.serverDataIndices[i] == id) {
				this.serverDataIndices.splice(i, 1);
				break;
			}
		}
	}

	recv() {
		let serverDataIndices = this.serverDataIndices;
		let serverData = this.serverData;
		let internalData = this.internalData;
		
		for (let i = 0; i < serverDataIndices.length; i++) {
			let index = serverDataIndices[i];

			let toBeRemovedFrom = internalData[index];
			let toBeAddedTo = serverData[index];

			toBeAddedTo.updateData = toBeAddedTo.updateData.concat(toBeRemovedFrom.updateData.splice(0));
		}

		return serverData;
	}

	queue(update) {
		this.localUpdates.push(update);
	}

	flush() {
		if (this.localUpdates.length > 0)
			this.connection.send(this.localUpdates.splice(0));
	}
}

class JSONUpdateIterator {
	constructor(updateData, copy) {
		this.updateData = updateData;
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

class UpdateProcessorStream {
	constructor(updateIterator, updaters) {
		this.updateIterator = updateIterator;
		this.updaters = updaters;
	}

	iterate() {
		var last = null;
	    while (true) {
	        let update = this.updateIterator.next();

	        if (last != null) {
	        	if (last == update) {
	        		console.log("Problem with "+update.name);
	        		break;
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

	        if (state == Networking.BREAK_DELETE || state == Networking.CONTINUE_DELETE)
	        	this.updateIterator.shift();

	        if (state == Networking.BREAK_DELETE || state == Networking.BREAK_NOTHING)
	        	break;

	        last = update;

	        if (!this.updateIterator.hasNext())
	            break;
	    }
	}
}

class Networking extends Timer{

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

		this.init();
	}

	init() {
		this.connectionHandler.init();

		this.addUpdateProcessor(new ConnectionUpdateProcessor(this));
	}

	addUpdate(update) {
		for (let processor of this.updateProcessors) {
			processor.modify(update);
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

	processUpdates(id, updaters) {
        let updateCache = this.connectionHandler.serverData[id].updateData;

        for (let processor of updaters) {
	    	processor.startProcess(id);
	    }

        if (updateCache.length > 0) {
        	new UpdateProcessorStream(new JSONUpdateIterator(updateCache, false), updaters).iterate();
        }

        for (let processor of updaters) {
	    	processor.endProcess(id);
	    }
	}

	update() {
		return super.update(() => {
			this.connectionHandler.recv();

			let serverDataIndices = this.connectionHandler.serverDataIndices;

		    for (let processor of this.updateProcessors) {
		    	processor.preprocess();
		    }

		    for (let i = 0; i < serverDataIndices.length; i++) {
		    	let id = serverDataIndices[i];

		        this.processUpdates(id, this.updateProcessors);
		    }

		    for (let processor of this.updateProcessors) {
		    	processor.postprocess();
		    }

			return true;
		});
	}
}