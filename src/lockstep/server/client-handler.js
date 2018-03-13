import {Server as WebSocketServer} from "ws";
import EventEmitter from "../../shims/events.js";
import {ClientList} from "../../base/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../../base/updates/streamed/client-stream.js";
import Packet from "./packet.js";
import ServerClient from "./client.js";
import LockstepClientInterface from "../lockstep-client-interface.js";

function encode(server, from, object) {
    return new Packet(from, JSON.stringify(object), server);
}

export default class ClientHandler extends LockstepClientInterface {
    constructor(port) {
        super();

        this.wss = new WebSocketServer({ port });
        this.local = this.clients.push(new LocalClientUpdateStream());
        this.clients.setHost(this.local.id());

        this.connections = [];
        this.packets = [];
        this.wss.on('connection', (ws) => {
            let cl = this.clients.push(new ServerClient(ws));
            ws.id = cl.id();

            this.connections.push(cl);

        	ws.on('message', (message) => {
                cl.cache(JSON.parse(message));
                this.packets.push(new Packet(cl.id(), message, false));

                this.emit("message", {client: cl, message});
        	});

        	ws.on('close', (ws2) => {
                this.packets.push(encode(true, this.local.id(), [{name: "CLIENT_REMOVED", id: cl.id()}]));
                this.packets.push(encode(false, cl.id(), [{name: "DISCONNECTED", id: cl.id()}]))
                cl.push({name: "DISCONNECTED", id: cl.id()});

                cl.toBeRemoved = true;

                this.emit("disconnection", cl);
         	});
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

        while (this.connections.length > 0) {
            let conn = this.connections.shift();
            //if (conn.connected) {
                let initialUpdates = [];

            	initialUpdates.push({name: "CONNECTED", id: conn.id(), isHost: conn.host()});
                initialUpdates.push({name: "CLIENTS_LIST", list: this.clients.export()});
                initialUpdates.push({name: "SET_HOST", id: this.clients.hostId});
                conn.send([encode(true, this.local.id(), initialUpdates).json()]);

                this.local.push({name: "CLIENT_ADDED", id: conn.id(), isHost: conn.host()});
                this.packets.push(encode(true, this.local.id(), [{name: "CLIENT_ADDED", id: conn.id(), isHost: conn.host()}]));

                this.emit("connection", conn);

                console.log("Added client " + conn.id());
        //    }
        }
    }

    flush() {
        let hostClient = this.clients.host();
        let it = this.clients.iterator();
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
                    if (client.connected) {
                        client.send(clUpdates);
                    } else {
                        //this.clients.remove(client.id());
                        if (client.toBeRemoved && client.updates.length == 0) {
                            this.clients.remove(client.id());
                        }
                        //console.log("Client error: " + e.message + " -> Removing client");
                    }
                }
            }
        }

        this.packets = [];
    }
}
