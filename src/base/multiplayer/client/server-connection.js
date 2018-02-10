import Multiplayer from "../multiplayer.js";
import {ClientList} from "../../engine/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../../engine/updates/streamed/client-stream.js";
import BasicIterator from "../../engine/updates/iteration.js";
import EventEmitter from "../../shims/events.js";

export default class ServerConnection extends Multiplayer {
	constructor(connection, ...args) {
		super(...args);

		this.local = null;
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
				if (!client) {
					client = this.clients.push(new ClientUpdateStream(updates.from));
				}

				client.cache(data2);
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
		let updates = this.local.toBeSent;

		//console.log(this.local);

        if (updates.length > 0) {
            this.connection.send(updates.splice(0));
        }

		this.local.flush();
	}

	update(frame) {
		this.recv();

		while (this.serverUpdates.length > 0) {
			this.process(this.serverUpdates.shift());
		}

		if (this.connected)
			this.local.update(frame);
	}

	process(update) {
		if (update.name == "CONNECTED") {
 			this.local = this.clients.push(new LocalClientUpdateStream(this.connection, update.id, update.isHost));
			this.connected = true;

			this.local.push({name: "INIT"}, false);

			this.emit("connected", this.local);
		} else if (update.name == "CLIENT_ADDED") {
			if (update.id != this.local.id()) {
				let nC = this.clients.push(new ClientUpdateStream(update.id, update.isHost));

				this.emit("client-added", nC);
			}
		} else if (update.name == "CLIENTS_LIST") {
			for (let cl of update.list) {
				if (this.local.id() != cl.id) {
					let cl2 = this.clients.push(new ClientUpdateStream(cl.id, cl.isHost));
					this.emit("client-added", cl2);
				}
			}
		} else if (update.name == "CLIENT_REMOVED") {
			let id = update.id;

			/*let cl = this.clients.get(id);
			if (cl.toBeRead > 0) {
				this.clients.remove(id);
			}*/

			this.emit("client-removed", id);
		} else if (update.name == "SET_HOST") {
			this.clients.setHost(update.id);

			this.emit("set-host", update.id);
		}
	}

	destory() {}
}
