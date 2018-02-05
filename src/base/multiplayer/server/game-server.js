import {Server as WebSocketServer} from "ws";
import EventEmitter from "../../shims/events.js";

import {ClientList} from "../../engine/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../client-stream.js";
import Packet from "./packet.js";
import ServerClient from "./client.js";
import Multiplayer from "../multiplayer.js";

function encode(from, object) {
    return new Packet(from, JSON.stringify(object));
}

export default class GameServer extends Multiplayer {
    constructor(port) {
        super();

        this.wss = new WebSocketServer({ port });

        this.clients = new ClientList();
        this.local = this.clients.push(new LocalClientUpdateStream());

        this.clients.setHost(this.local.id());

        this.packets = [];
        this.wss.on('connection', (ws) => {
            let cl = this.clients.push(new ServerClient(ws));
            let local = [];

            /*if (this.clients.length() == 2) {
                this.clients.setHost(cl.id());
            }*/

            ws.id = cl.id();

        	local.push({name: "CONNECTED", id: cl.id(), isHost: cl.host()});
            local.push({name: "CLIENTS_LIST", list: this.clients.export()});

            cl.send([encode(this.local.id(), local).json()]);

            this.packets.push(encode(this.local.id(), [{name: "CLIENT_ADDED", id: cl.id(), isHost: cl.host()}]));

        	ws.on('message', (message) => {
                cl._cachedUpdates = cl._cachedUpdates.concat(JSON.parse(message));
                this.packets.push(new Packet(cl.id(), message));
        	});

        	ws.on('close', (ws2) => {
        		this.clients.remove(cl.id());
         	});
        });

        this.emit("connected");
        this.connected = true;
    }

    getLocalClient() {
        return this.local;
    }

    getClients() {
        return this.clients;
    }

    update() {}

    flush() {
        let hostClient = this.clients.host();
        let it = this.clients.iterator();
        let c = 0;

        let localUpdatePacket = encode(this.local.id(), this.local.localUpdates.splice(0)).json();

        while (it.hasNext()) {
            let client = it.next();

            if (client != this.local) {
                let clUpdates = [localUpdatePacket];

                for (let i = 0; i < this.packets.length; i++) {
                    let p = this.packets[i];

                    if (p.from != client.id()) {
                        clUpdates.push(p.json());
                    }
                }

                if (clUpdates.length > 0) {
                    client.send(clUpdates);
                }
            }
        }

        this.packets = [];
    }
}
