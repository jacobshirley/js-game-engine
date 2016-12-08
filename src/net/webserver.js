var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

var MAX_CLIENTS = 64;

var clientIndices = [];
var clients = [];

var updates = [];

wss.on('connection', function connection(ws) {
	clients.push(ws);

	ws.id = clients.length-1;
	//ws.send());

	updates.push({from: -1, data: {name: "CONNECTED", isHost: ws.id == 0, id: ws.id}});

	ws.on('message', function incoming(message) {
		//console.log("got message "+message);
		updates.push({from: ws.id, data: JSON.parse(message)});
	});

	ws.on('close', function (ws2) {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i] == ws) {
				clients.splice(i, 1);
				break;
			}
		}
 	});
});

setInterval(function() {
	if (updates.length > 0) {
		for (var i = 0; i < clients.length; i++) {
			var client = clients[i];
			var us = [];

			updates.forEach(function(update) {
				//if (update.from != client.id) {
					us.push(update);
				//}
			});
			if (us.length > 0) {
				var str = JSON.stringify(us);
				client.send(str);
			}
		}
		updates = [];
	}
}, 50);

console.log("Running server...");