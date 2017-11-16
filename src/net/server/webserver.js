import Timer from "../../timing/timer.js";
import {UpdateStream, ClientUpdateStream, ClientList} from "../../updates/stream.js";

class Server {
    constructor(clientList) {
        this.clients = clientList;
    }

    update() {
        let id = this.clients.iterator();
    }
}

function run() {
    let timer = new Timer();
    let server = new Server();

    timer.update(() => {
        server.update();
    });
}

class ServerClientUpdateStream extends ClientUpdateStream {
    constructor(ws, id, isHost) {
        super(id, isHost);
        this.ws = ws;
    }
}

class ServerClientList extends ClientList {
    constructor(wss) {
        super();
        this.wss = wss;
        this.localClient = this.create();

        this.wss.on('connection', (ws) => {
            let cl = this.create();
            if (this.length() == 2) {
                this.setHost(cl.id);
            }

            ws.id = cl.id;
        	this.localClient.push({name: "CONNECTED", id: cl.id, isHost: cl.isHost, clients: this.jsonObject()});

        	ws.on('message', (message) => {
        		cl.push({from: cl.id, us: new UpdateStream(JSON.parse(message))});
        	});

        	ws.on('close', (ws2) => {
        		this.remove(cl.id);
         	});
        });

        create(id, isHost, ws) {
            if (!ws)
                return super.create(id, isHost);

            return this.push(new ServerClientUpdateStream(ws, id, isHost));
        }
    }

    local() {
        return this.localClient;
    }
}

var WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({ port: 8080 });

var SERVER_INDEX = 0;
var MAX_CLIENTS = 64;

const SEND_RATE = 1000 / 60;

var clients = new ServerClientList(wss);

setInterval(function() {
    let updates = [];

	let clientsIterator = clients.iterator();
    while (clientsIterator.hasNext()) {
		let client = clientsIterator.remove();
        let id = client.id;

		let pIt = client.iterator();

        while (pIt.hasNext()) {
            let uIt = pIt.iterator();
            console.log("LOL");
        }
	}
	updates = [];
}, SEND_RATE);

console.log("Running server...");
