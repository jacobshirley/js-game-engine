import UpdateQueue from "./update-queue.js";
import {ClientUpdateStream, LocalClientUpdateStream} from "./stream.js";

const SERVER_ID = 0;

export default class NetworkedUpdateQueue extends UpdateQueue {
	constructor(connection) {
		super();

		this.connection = connection;
		this.connected = false;

		this.streamIds = [];

		this.myClient = new LocalClientUpdateStream(this.connection, -1, true);
		this.streams = [];

		this.connection.on('message', (data) => {
			for (let i = 0; i < data.length; i++) {
				let updates = data[i];

				let client = this.getClient(updates.from);
				if (!client)
					client = this.addClient(updates.from, false);

				client.cachedUpdates = client.cachedUpdates.concat(updates.data);
			}
		});
	}

	process(update) {
		if (update.name == "CONNECTED") {
			if (!this.connected) {
				this.connected = true;

				this.myClient.id = update.id;
				this.myClient.isHost = update.isHost;

				this.setClient(update.id, this.myClient);
			}

			for (let cl of update.clients) {
				this.addClient(cl.id, cl.isHost);
			}
		} else if (update.name == "DISCONNECTED") {
			for (let id of update.clients) {
				this.removeClient(id);
			}
		} else if (update.name == "SET_HOST") {
			this.myClient.isHost = true;
		}
	}

	get id() {
		return this.myClient.id;
	}

	get isHost() {
		return this.myClient.isHost;
	}

	clientExists(id) {
		return this.streamIds.indexOf(id) != -1;
	}

	getClient(id) {
		return this.streams[this.streamIds.indexOf(id)];
	}

	addClient(id, isHost) {
		if (!this.clientExists(id)) {
			this.streamIds.push(id);

			this.addStream(new ClientUpdateStream(id, isHost));
		} else {
			let cl = this.getClient(id);
			cl.isHost = isHost;
			this.setClient(id, cl);
			return cl;
		}

		return this.getClient(id);
	}

	setClient(id, client) {
		if (this.clientExists(id)) {
			this.streams[this.streamIds.indexOf(id)] = client;
		} else {
			this.streamIds.push(id);

			this.addStream(client);
		}

		return client;
	}

	removeClient(id) {
		let index = this.streamIds.indexOf(id);

		this.removeStream(this.streams[index]);
		this.streamIds.splice(index, 1);
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
		this.myClient.push(update);
	}

	broadcast(update) {
		for (let st of this.streams)
			st.push(update);
	}

	flush() {
		this.myClient.flush();
	}

	update() {
		this.recv();

		let cl = this.getClient(SERVER_ID);
		if (cl != null) {
			let jsonUpdater = cl.iterator();

			while (jsonUpdater.hasNext()) {
				let u = jsonUpdater.remove();
				this.process(u);
				for (let processor of this.processors) {
			    	//processor.startProcess(u.clientId);
			    	processor.process(u);
			    	//processor.endProcess(u.clientId);
			    }
			}
		}
	}
}
