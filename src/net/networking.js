var SERVER_INDEX = 0;

function Networking(client, physics, maxConnections) {
	this.client = client;
	this.physics = physics;

	this.tick = 0;

	this.isHost = false;
	this.clientData = [];
	this.clientDataIndices = [SERVER_INDEX];

	this.maxConnections = maxConnections;

	this.processingClients = [];

	this.updateProcessors = [];

	this.init();
}

Networking.prototype.init = function() {
	this.clientData = [];
	this.clientDataIndices = [SERVER_INDEX];

	var _this = this;

	for (var i = -1; i < this.maxConnections; i++) {
		this.clientData.push({id: i, updates: []});
	}

	this.addUpdateProcessor({process: function(update) {
		if (update.frame)
			return true;

        if (update.name == "CONNECTED") {
            _this.addClient(update.id+1);
            _this.isHost = update.isHost;

            _this.client.updates.push({name: "CONNECTION", id: update.id});
        }
    }});
}

Networking.prototype.addUpdate = function (update) {
	this.client.updates.push(update);
}

Networking.prototype.addClient = function (clientId) {
	this.clientDataIndices.push(clientId);
}

Networking.prototype.removeClient = function (clientId) {
	var inds = this.clientDataIndices;
	for (var i = 0; i < inds.length; i++) {
		if (inds[i] == clientId) {
			this.clientData[inds[i]].updates = [];
			inds.splice(i, 1);
			break;
		}
	}
}

Networking.prototype.addUpdateProcessor = function (processor) {
	this.updateProcessors.push(processor);
}

Networking.prototype.removeUpdateProcessor = function (processor) {
	// TO DO
}

Networking.prototype.processUpdates = function (updates) {
    while (true) {
        var update = updates[0];

        var bool = false;
        this.updateProcessors.forEach(function(processor) {
        	bool = processor.process(update);
        });

        //if (bool)
        	//break;

        updates.shift();
        if (updates.length == 0)
            break;
    }
}

Networking.prototype.update = function () {
	this.tick++;
	
	var clientDataIndices = this.clientDataIndices;
	var serverUpdates = this.client.serverUpdates;
	
	for (var i = 0; i < clientDataIndices.length; i++) {
		var id = clientDataIndices[i];

		var toBeRemovedFrom = serverUpdates[id];
		var toBeAddedTo = this.clientData[id];
	
		toBeAddedTo.updates = toBeAddedTo.updates.concat(toBeRemovedFrom.updates.splice(0));
	}
	
	var clientData = this.clientData;

	var appliedUpdates = [];
    var stoppedUpdates = [];

    for (var i = 0; i < clientDataIndices.length; i++) {
    	var ind = clientDataIndices[i];

    	//console.log(ind);

        var id = clientData[ind].id;
        var updateCache = clientData[ind].updates;

        //console.log(updateCache);

        var index = this.processingClients.indexOf(id);

        if (updateCache.length > 0) {
        	this.processUpdates(updateCache);
        } else if (index != -1) {
            stoppedUpdates.push(id);
            this.processingClients.splice(index, 1);
        }
    }

    if (this.client.isHost) {
	    if (appliedUpdates.length > 0)
	        this.client.updates.push({name: "APPLY", frame: client.tick, updateMeta: appliedUpdates});

	    if (stoppedUpdates.length > 0)
	        this.client.updates.push({name: "STOP_APPLYING", frame: client.tick, updateMeta: stoppedUpdates});
	}
}