import Multiplayer from "../multiplayer.js";
import {ClientList} from "../../engine/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../client-stream.js";
import BasicIterator from "../../engine/updates/iteration.js";
import EventEmitter from "../../shims/events.js";

export default class ServerConnection extends Multiplayer {
	constructor(connection, ...args) {
		super(...args);

		this.local = null;
		this.clients = new ClientList();
		//this.clients.push(new ClientUpdateStream(0, true));

		this.connection = connection;
		this.connected = false;

		this.queue = null;

		this.serverUpdates = [];

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updates = data[i];
				let data2 = JSON.parse(updates.data);

				if (updates.server) {
					this.serverUpdates = this.serverUpdates.concat(data2);
				}

				let client = this.clients.get(updates.from);
				//console.log("from: "+this.clients.get(updates.from));
				if (!client) {
					//console.log("create");
					client = this.clients.push(new ClientUpdateStream(updates.from));
				}

				client._cachedUpdates = client._cachedUpdates.concat(data2);
			}
		});
	}

    getLocalClient() {
        return this.local;
    }

    getClients() {
        return this.clients;
    }

	flush() {
		let updates = this.localUpdates;

        if (updates.length > 0) {
            this.connection.send(updates.splice(0));
        }

		this.local.flush();
	}

	update(frame) {
		while (this.serverUpdates.length > 0) {
			this.process(this.serverUpdates.shift());
		}
	}

	process(update) {
		if (update.name == "CONNECTED") {
 			this.local = this.clients.push(new LocalClientUpdateStream(this.connection, update.id, update.isHost));
			this.connected = true;

			this.emit("connected", this.local);
		} else if (update.name == "CLIENT_ADDED") {
			let nC = this.clients.push(new ClientUpdateStream(update.id, update.isHost));

			this.emit("client-added", nC)
		} else if (update.name == "CLIENTS_LIST") {
			for (let cl of update.list) {
				if (this.local.id() != cl.id) {
					//console.log(cl.id + ", " + this.clients.has(cl.id));
					let cl2 = this.clients.push(new ClientUpdateStream(cl.id, cl.isHost));
					//console.log(this.clients.length());
					this.emit("client-added", cl2);
				}
			}
		} else if (update.name == "CLIENT_REMOVED") {
			for (let id of update.clients) {
				this.clients.remove(id);

				this.emit("client-removed", id);
			}
		} else if (update.name == "SET_HOST") {
			this.clients.setHost(update.id);

			this.emit("set-host", update.id);
		}
	}

	destory() {}
}
