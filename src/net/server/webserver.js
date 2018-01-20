import Timer from "../../timing/timer.js";
import UpdateStream from "../../updates/stream.js";
import {ClientList, Client} from "../../updates/client.js";
import BasicIterator from "../../updates/iteration.js";

class ServerClient extends Client {
    constructor(ws, id, isHost) {
        super(id, isHost);
        this.ws = ws;
    }

    send(data) {
        return this.ws.send(JSON.stringify(data));
    }
}

class Packet extends UpdateStream {
    constructor(from, string) {
        super();

        this.from = from;
        this.string = string;
    }

    decode() {
        this.updates = JSON.parse(this.string);
    }

    json() {
        return {from: this.from, data: this.string};
    }

    iterator() {
        return new BasicIterator(this.updates, true);
    }
}

function encode(from, object) {
    return new Packet(from, JSON.stringify(object));
}

class ServerClientList extends ClientList {
    constructor() {
        super();
    }

    alloc(ws) {
        return this.push(new ServerClient(ws));
    }
}

class Server {
    constructor(wss) {
        this.wss = wss;
        this.clients = new ServerClientList();

        this.local = this.clients.push(new Client());

        this.packets = [];
        this.wss.on('connection', (ws) => {
            let cl = this.clients.alloc(ws);

            if (this.clients.length() == 2) {
                this.clients.setHost(cl.id());
            }

            ws.id = cl.id();
        	this.packets.push(encode(this.local.id(), {name: "CONNECTED", id: cl.id(), isHost: cl.host(), clients: this.clients.export()}));

        	ws.on('message', (message) => {
        		this.packets.push(new Packet(cl.id(), message));
        	});

        	ws.on('close', (ws2) => {
        		this.clients.remove(cl.id());
         	});
        });
    }

    update() {
        let hostClient = this.clients.host();


        let it = this.clients.iterator();
        let c = 0;
        while (it.hasNext()) {
            let client = it.next();
            if (client != this.local) {
                let clUpdates = [];
                for (let i = 0; i < this.packets.length; i++) {
                    let p = this.packets[i];

                    if (p.from != client.id()) {
                        clUpdates.push(p.json());
                    }
                }

                if (clUpdates.length > 0) {
                    console.log(client.id());
                    client.send(clUpdates);
                }
            }
        }

        this.packets = [];
    }

    broadcastAllExcept(data, except) {
        let it = this.clients.iterator();
        while (it.hasNext()) {
            let cl = it.remove();
            if (cl != this.local && cl != except) {
                cl.send(data);
            }
        }
    }
}

const WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({ port: 8080 });

const SERVER_INDEX = 0;
const MAX_CLIENTS = 64;
const SEND_RATE = 1000 / 60;

function run() {
    let timer = new Timer();
    let server = new Server(wss);

    setInterval(() => {
        timer.update(() => {
            server.update();
        });
    }, SEND_RATE);
}

run();

console.log("Running server...");
