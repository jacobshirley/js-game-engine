let SERVER_INDEX = 0;

class UpdateProcessor {
	constructor(networking) {
		this.networking = networking;
	}

	preprocess() {

	}

	startProcess(clientId) {

	}

	process() {

	}

	endProcess(clientId) {
		
	}

	postprocess() {

	}
}

class ConnectionUpdateProcessor extends UpdateProcessor {
	constructor(networking) {
		super(networking);
		this.initialised = false;
	}

	process(update) {
		if (update.frame)
			return Networking.SKIP;

		let networking = this.networking;

        if (update.name == "CONNECTED") {
        	for (var i = networking.clientDataIndices.length; i <= update.id+1; i++) {
        		console.log("adding clients...");
        		networking.addClient(i);
        	}
        	if (!this.initialised) {
	        	this.initialised = true;

	            networking.isHost = update.isHost;
	            networking.id = update.id;

	            networking.addUpdate({name: "CONNECTION", id: update.id});
	        }

            return Networking.CONTINUE_DELETE;
        }

        //should never get this far
        return Networking.SKIP;
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

		this.client = client;

		//this.tick = 0;
		this.time = 0;

		this.id = -1;
		this.isHost = false;

		this.clientData = [];
		this.clientDataIndices = [SERVER_INDEX];

		this.maxConnections = maxConnections;

		this.processingClients = [];

		this.updateProcessors = [];

		this.serverDelay = null;

		this.init();
	}

	init() {
		this.clientData = [];
		this.clientDataIndices = [SERVER_INDEX];

		let _this = this;

		for (let i = -1; i < this.maxConnections; i++) {
			this.clientData.push({id: i, updates: []});
		}

		this.addUpdateProcessor(new ConnectionUpdateProcessor(this));
	}

	addUpdate(update) {
		this.client.updates.push(update);
	}

	addClient(clientId) {
		this.clientDataIndices.push(clientId);
	}

	removeClient(clientId) {
		let inds = this.clientDataIndices;
		for (let i = 0; i < inds.length; i++) {
			if (inds[i] == clientId) {
				this.clientData[inds[i]].updates = [];
				inds.splice(i, 1);
				break;
			}
		}
	}

	addUpdateProcessor(processor) {
		processor.networking = this;

		this.updateProcessors.push(processor);
	}

	removeUpdateProcessor(processor) {
		// TO DO
	}

	sendUpdates() {
		this.client.sendUpdates();
	}

	getUpdate(clientId) {

	}

	processUpdates(updates, updaters) {
		let cont = true;
	    while (cont) {
	        let update = updates[0];

	        let state = -1;
	        updaters.forEach(function(processor) {
	        	let state2 = processor.process(update);
	        	if (state == -1) {
	        		state = state2 || Networking.SKIP;
	        	} else if (state == Networking.SKIP && state2 != state) {
	        		state = state2;
	        	} else if (state == Networking.CONTINUE_DELETE && (state2 == Networking.BREAK_DELETE || state2 == Networking.BREAK_NOTHING)) {
	        		throw "Processor conflict: CONTINUE_DELETE and BREAK_* are incompatible. Please check your updaters.";
	        		//alert("ERRORORORO");
	        	} else if (state == Networking.BREAK_NOTHING && state2 == Networking.BREAK_DELETE) {
	        		state = state2;
	        	}
	        });

	        if (state == Networking.BREAK_DELETE || state == Networking.CONTINUE_DELETE)
	        	updates.shift();

	        if (state == Networking.BREAK_DELETE || state == Networking.BREAK_NOTHING)
	        	break;

	        if (updates.length == 0)
	            break;
	    }
	}

	update() {
		return super.update(() => {
			let clientDataIndices = this.clientDataIndices;
			let serverUpdates = this.client.serverUpdates;
			
			for (let i = 0; i < clientDataIndices.length; i++) {
				let id = clientDataIndices[i];

				let toBeRemovedFrom = serverUpdates[id];
				let toBeAddedTo = this.clientData[id];
			
				toBeAddedTo.updates = toBeAddedTo.updates.concat(toBeRemovedFrom.updates.splice(0));
			}
			
			let clientData = this.clientData;

			let appliedUpdates = [];
		    let stoppedUpdates = [];

		    this.updateProcessors.forEach(function(processor) {
		    	if (processor.preprocess)
		    		processor.preprocess();
		    });

		    for (let i = 0; i < clientDataIndices.length; i++) {
		    	let ind = clientDataIndices[i];

		        let id = clientData[ind].id;
		        let updateCache = clientData[ind].updates;

		        this.updateProcessors.forEach(function(processor) {
			    	if (processor.startProcess)
			    		processor.startProcess(id);
			    });

		        if (updateCache.length > 0) {
		        	this.processUpdates(updateCache, this.updateProcessors);
		        }

		        this.updateProcessors.forEach(function(processor) {
			    	if (processor.endProcess)
			    		processor.endProcess(id);
			    });
		    }

		    this.updateProcessors.forEach(function(processor) {
		    	if (processor.postprocess)
		    		processor.postprocess();
		    });

			return true;
		});
	}
}