import Client from "../client.js";
import {ClientList} from "../client.js";
import BasicIterator from "../iteration.js";

export class ClientUpdateStream extends Client {
	constructor(id, isHost) {
		super();

		this._id = id;
		this._isHost = isHost;
		this._updates = [];
		this._cachedUpdates = [];
	}

	updates() {
		return this._updates;
	}

	push(update) {
		this._updates.push(update);
	}

	recv() {
		this._updates = this._updates.concat(this._cachedUpdates.splice(0));
	}

	iterator() {
		return new BasicIterator(this._updates, false);
	}
}

export class LocalClientUpdateStream extends ClientUpdateStream {
	constructor(connection, id, isHost) {
		super(id, isHost);

        this.connection = connection;
		this.localUpdates = [];
	}

	push(update) {
		super.push(update);

		this.localUpdates.push(update);
	}

    flush() {
        let updates = this.localUpdates;

        if (updates.length > 0) {
            this.connection.send(updates.splice(0));
        }
    }
}

export class ClientsStreamManager extends ClientList {
	constructor(connection, ...args) {
		super(...args);

		this.local = new LocalClientUpdateStream(connection, -1, false);
		this.connection = connection;
		this.connected = false;
		this.events = new EventEmitter();

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updates = data[i];

				let client = this.get(updates.from);
				if (!client) {
					client = this.push(new ClientUpdateStream(updates.from, false));
				}

				client._cachedUpdates = client._cachedUpdates.concat(JSON.parse(updates.data));
			}
		});
	}

	process(update) {
		if (update.name == "CONNECTED") {
			let nC = null;
			if (!this.connected) {
				this.connected = true;

				this.local.id(update.id);
				this.local.host(update.isHost);

				nC = this.push(this.local);

				for (let cl of update.clients) {
					if (this.local.id() != cl.id) {
						let cl2 = this.push(new ClientUpdateStream(cl.id, cl.isHost));
						this.events.emit("connected", cl2);
					}
				}
			} else {
				nC = this.push(new ClientUpdateStream(update.id, update.isHost));
			}

			this.events.emit("connected", nC);
		} else if (update.name == "DISCONNECTED") {
			for (let id of update.clients) {
				this.remove(id);
			}
		} else if (update.name == "SET_HOST") {
			this.setHost(this.local.id());
		}
	}

	destory() {}
}
