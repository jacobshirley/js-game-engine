var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

var SERVER_INDEX = 0;
var MAX_CLIENTS = 64;

var clientIndices = [];
var clients = [];

var SEND_RATE = 10;

for (var i = -1; i < MAX_CLIENTS; i++) {
	clients.push({id: -1, socket: null});
}

var updates = [];

wss.on('connection', function connection(ws) {
	var newId = -1;
	for (var i = 0; i < clients.length; i++) {
		if (i != SERVER_INDEX) {
			if (clients[i].id == -1) {
				newId = i;
				break;
			}
		}
	}

	ws.id = newId;

	clientIndices.push(ws.id);
	clients[ws.id].id = ws.id;
	clients[ws.id].socket = ws;

	updates.push({from: SERVER_INDEX, data: {name: "CONNECTED", isHost: clientIndices.length == 1, clients: clientIndices, id: ws.id}});

	ws.on('message', function incoming(message) {
		//console.log("got message "+message);
		updates.push({from: ws.id, data: JSON.parse(message)});
	});

	ws.on('close', function (ws2) {
		for (var i = 0; i < clientIndices.length; i++) {
			var index = clientIndices[i];
			if (clients[index].socket == ws) {
				clients[index].id = -1;
				clients[index].socket = null;
				clientIndices.splice(i, 1);
				break;
			}
		}
 	});
});

setInterval(function() {
	if (updates.length > 0) {
		for (var i = 0; i < clientIndices.length; i++) {
			var client = clients[clientIndices[i]];
			var us = [];

			updates.forEach(function(update) {
				//if (update.from != client.id) {
					us.push(update);
				//}
			});
			if (us.length > 0) {
				var str = JSON.stringify(us);
				client.socket.send(str);
			}
		}
		updates = [];
	}
}, SEND_RATE);

console.log("Running server...");