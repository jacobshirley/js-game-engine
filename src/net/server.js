function Client(name) {
	this.name = name;
	this.objectIndex = -1;
	this.objectImpulseData = null;
	this.updateObjects = null;
	this.draggingHandle = null;

	this.updates = [];
	this.serverUpdates = [];

	this.receivedUpdates = [];
}

Client.prototype.sendUpdates = function() {
	this.serverUpdates = this.updates.splice(0);
}

Client.prototype.queueUpdates = function(queue) {
	this.receivedUpdates = this.receivedUpdates.concat(this.serverUpdates.splice(0));
}

function WebClient(name) {
	this.ws = new WebSocket("ws://127.0.0.1:8080/");
	this.connected = false;

	this.isHost = false;

	this.tick = 0;

	var _this = this;
	this.ws.onopen = function() {
		console.log("CONNECTED");
		_this.connected = true;
	}
	
	this.ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		if (data.id) {
			_this.id = data.id;
		}
		if (data.isHost) {
			_this.isHost = true;
		} else {
			//console.log("got server updates "+_this.serverUpdates.length+", new data length "+data.length);
			var data = JSON.parse(msg.data);
			for (var i = 0; i < data.length; i++)
				_this.cacheUpdates(data[i]);
			
			//console.log(_this.serverUpdates);
		}

		_this.onMessages.forEach(function (oM) {
			oM(data);
		});
		//console.log(_this.serverUpdates.length);
	}
	
	this.updates = [];

	this.serverUpdates = [];
	this.receivedUpdates = [];

	for (var i = 0; i < 64; i++) {
		this.serverUpdates.push({id: i, updates: []});
		this.receivedUpdates.push({id: i, updates: []});
	}

	this.onMessages = [];
}

WebClient.prototype.cacheUpdates = function(data) {
	var obj = this.serverUpdates[data.from];

	obj.updates = obj.updates.concat(data.data);
}

WebClient.prototype.send = function(data) {
	if (this.connected) {
		this.ws.send(JSON.stringify(data));
	}
}

WebClient.prototype.sendUpdates = function() {
	if (this.connected && this.updates.length > 0) {
		//console.log("Sending "+this.updates.length+ " updates");
		//
		this.ws.send(JSON.stringify(this.updates.splice(0)));
	}
}

WebClient.prototype.recv = function() {
	var serverUpdates = this.serverUpdates;
	var recvUpdates = this.receivedUpdates;
	
	for (var i = 0; i < serverUpdates.length; i++) {
		var id = serverUpdates[i].id;

		var toBeRemovedFrom = serverUpdates[id];
		var toBeAddedTo = recvUpdates[id];

		if (toBeRemovedFrom.updates.length > 0) {
			//console.log("Recieved "+toBeRemovedFrom.updates.length+ " updates");
		}
	
		toBeAddedTo.updates = toBeAddedTo.updates.concat(toBeRemovedFrom.updates.splice(0));
	}
}

function Server() {
	this.clients = [];
	this.updates = [];
}

Server.prototype.addClient = function(client) {
	this.clients.push(client);
}

Server.prototype.removeClient = function() {
	
}

Server.prototype.addObject = function(object) {
	//this.physics.addObject(object);
}

Server.prototype.update = function() {
	/*var cls = this.clients;
	cls.forEach(function(client) {
		cls.forEach(function(client2) {
			//if (client != client2) {
				client.queueUpdates(client2.serverUpdates);
			//}
		});
	});*/
}