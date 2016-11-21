var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

var clients = [];
var updates = [];

wss.on('connection', function connection(ws) {
	clients.push(ws);

	ws.send(JSON.stringify({isHost: clients.length == 1, id: clients.length}));

	ws.on('message', function incoming(message) {
		//console.log("got message "+message);
		updates.push({from: ws, data: JSON.parse(message)});
	});

	ws.on('close', function (ws2) {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i] == ws2) {
				clients.splice(i, 1);
				break;
			}
		}
 	});

	//ws.send('something');
});

setInterval(function() {
	if (updates.length > 0) {
		for (var i = 0; i < clients.length; i++) {
			var client = clients[i];
			var us = [];

			updates.forEach(function(update) {
				if (update.from != client) {
					us = us.concat(update.data);
				}
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