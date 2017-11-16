import UpdateQueue from "./update-queue.js";
import {ClientUpdateStream, LocalClientUpdateStream, ClientList} from "./stream.js";

const SERVER_ID = 0;

class ClientUpdateList extends ClientList {
	constructor(connection, ...args) {
		super(...args);

		this.localClientId = -1;
		this.connection = connection;
		this.connected = false;
		this.events = new EventEmitter();

		this.connection.on("message", (data) => {
			for (let i = 0; i < data.length; i++) {
				let updates = data[i];

				let client = this.get(updates.from);
				if (!client) {
					client = this.create(updates.from);
				}

				client.cachedUpdates = client.cachedUpdates.concat(updates.data);
			}
		});
	}

	local() {
		if (this.localClientId != -1)
			return this.get(this.localClientId);
	}

	process() {
		if (update.name == "CONNECTED") {
			if (!this.connected) {
				this.connected = true;
				this.localClientId.id = update.id;

				let client = new LocalClientUpdateStream(this.connection, update.id, update.isHost);
				this.set(client);

				this.events.emit("connected", {client, me: true});
			}

			for (let client of update.clients) {
				if (!this.has(client.id))
					this.events.emit("connected", {client, me: false});

				this.create(client.id, client.isHost);
			}
		} else if (update.name == "DISCONNECTED") {
			for (let id of update.clients) {
				this.remove(id);
			}
		} else if (update.name == "SET_HOST") {
			this.local().isHost = true;
		}
	}

	destory() {}
}

export default class NetworkedUpdateQueue extends UpdateQueue {
	constructor(connection) {
		super();

		this.connection = connection;

		this.clientList = new ClientUpdateList(connection);

		this.addProcessor(this.clientList);
		this.streamIds = [];

		this.streams = [];
	}
	local() {
		return this.clientList.local();
	}

	get id() {
		if (this.local)
			return this.local().id;
		else {
			return -1;
		}
	}

	get isHost() {
		if (this.local())
			return this.local().isHost;
		else {
			return false;
		}
	}

	get connected() {
		return this.clientList.connected;
	}

	recv() {
		let clientIds = this.streamIds;
		let clients = this.streams;

		for (let i = 0; i < clientIds.length; i++) {
			let client = clients[i];

			client.recv();
		}
	}

	push(update) {
		this.local().push(update);
	}

	broadcast(update) {
		for (let st of this.streams)
			st.push(update);
	}

	flush() {
		if (this.local())
			this.local().flush();
	}

	update() {
		this.recv();

		let cl = this.getClient(SERVER_ID);
		if (cl != null) {
			let jsonUpdater = cl.iterator();

			while (jsonUpdater.hasNext()) {
				let u = jsonUpdater.remove();
				//this.process(u);
				for (let processor of this.processors) {
			    	//processor.startProcess(u.clientId);
			    	processor.process(u);
			    	//processor.endProcess(u.clientId);
			    }
			}
		}
	}
}
