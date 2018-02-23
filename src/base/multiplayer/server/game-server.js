import {Server as WebSocketServer} from "ws";
import EventEmitter from "../../shims/events.js";

import {ClientList} from "../../engine/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../../engine/updates/streamed/client-stream.js";
import Packet from "./packet.js";
import ServerClient from "./client.js";
import Multiplayer from "../multiplayer.js";

function encode(server, from, object) {
    return new Packet(from, JSON.stringify(object), server);
}

export default class GameServer extends Multiplayer {
    constructor(port) {
        super();

        this.wss = new WebSocketServer({ port });
        this.local = this.clients.push(new LocalClientUpdateStream());
        this.clients.setHost(this.local.id());

        this.packets = [];
        this.wss.on('connection', (ws) => {
            let cl = this.clients.push(new ServerClient(ws));
            let local = [];

            console.log("Added client "+cl.id());
            ws.id = cl.id();

        	local.push({name: "CONNECTED", id: cl.id(), isHost: cl.host()});
            local.push({name: "CLIENTS_LIST", list: this.clients.export()});
            local.push({name: "SET_HOST", id: this.clients.hostId});

            cl.send([encode(true, this.local.id(), local).json()]);

            this.local.push({name: "CLIENT_ADDED", id: cl.id(), isHost: cl.host()});
            this.packets.push(encode(true, this.local.id(), [{name: "CLIENT_ADDED", id: cl.id(), isHost: cl.host()}]));

        	ws.on('message', (message) => {
                cl.cache(JSON.parse(message));
                this.packets.push(new Packet(cl.id(), message, false));

                this.emit("message", {client: cl, message: message});
        	});

        	ws.on('close', (ws2) => {
                this.packets.push(encode(true, this.local.id(), [{name: "CLIENT_REMOVED", id: cl.id()}]));

                this.emit("disconnection", cl);
         	});

            this.emit("connection", cl);
        });

        this.emit("connected");
        this.connected = true;
    }

    getLocalClient() {
        return this.local;
    }

    update(frame) {
        this.recv();
        this.local.update(frame);
    }

    flush() {
        let hostClient = this.clients.host();
        let it = this.clients.iterator();
        let c = 0;
        let us = this.local.toBeSent.splice(0);

        let localUpdatePacket = encode(false, this.local.id(), us).json();

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
                    try {
                        client.send(clUpdates);
                    } catch (e) {
                        this.clients.remove(client.id());
                        console.log("Client error: " + e.message + " -> Removing client");
                    }
                }
            }

            c++;
        }

        this.packets = [];
    }
}
