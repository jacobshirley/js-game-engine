import BasicIterator from "./iteration.js";

export default class UpdateStream {
	constructor(updates) {
		this.updates = updates || [];
	}

	push(update) {
		this.updates.push(update);
	}

	iterator() {
		return new BasicIterator(this.updates);
	}
}

export class ClientUpdateStream extends UpdateStream {
	constructor(id, isHost) {
		super();

		this.id = id;
		this.isHost = isHost;
		this.cachedUpdates = [];
	}

	recv() {
		this.updates = this.updates.concat(this.cachedUpdates.splice(0));
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

export class ClientList {
    constructor() {
        this.hostId = -1;
        this.clients = [];
        this.clientIds = [];
    }

    length() {
        return this.clients.length;
    }

    has(id) {
        return this.clientIds.indexOf(id) != -1;
    }

    get(id) {
        return this.clients[this.clientIds.indexOf(id)];
    }

	push(client) {
		id = client.id;
		if (id && id != -1 && this.has(id))
			return;

		if (!id || id == -1)
			id = this.clients.length;

		client.id = id;
		client.isHost = client.isHost || false;

        this.clients.push(client);
        this.clientIds.push(id);

        return client;
	}

    create(id, isHost) {
        return this.push(new ClientUpdateStream(id, isHost));
    }

	set(client) {
		this.clients[this.clientIds.indexOf(client.id)] = client;
	}

    remove(id) {
        let i = this.clientIds.indexOf(id);
        if (i != -1) {
            this.clients.splice(id, 1);
            this.clientIds.splice(id, 1);
        }
    }

    setHost(id) {
        if (this.has(id) && id != this.hostId) {
            if (this.hostId > -1) {
                this.get(this.hostId).isHost = false;
            }

            this.hostId = id;
            let stream = this.get(id);
            stream.isHost = true;
        }
    }

	host() {
		return this.get(this.hostId);
	}

    jsonObject() {
        let jsonObj = [];

        for (let i = 0; i < this.clients.length; i++) {
            let cl = this.clients[i];
            jsonObj.push({id: cl.id, isHost: cl.isHost});
        }

        return jsonObject;
    }

    iterator() {
        return new BasicIterator(this.clients, true);
    }
}
