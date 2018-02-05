import BasicIterator from "./iteration.js";

export default class Client {
	constructor(id, isHost) {
		this._id = id;
		this._isHost = isHost;
	}

	host(value) {
		if (typeof value === "undefined") {
			return this._isHost;
		}

		this._isHost = value;
		return this._isHost;
	}

	id(value) {
		if (typeof value === "undefined") {
			return this._id;
		}

		this._id = value;
		return this._id;
	}
}

export class ClientList {
    constructor() {
        this.hostId = -1;
        this.arr = [];
        this.arrIds = [];
    }

    length() {
        return this.arr.length;
    }

    has(id) {
        return this.arrIds.indexOf(id) != -1;
    }

    get(id) {
        return this.arr[this.arrIds.indexOf(id)];
    }

	push(client) {
		let id = client.id();
		let isSet = !(typeof id === 'undefined');

		if (!isSet || id == -1) {
			id = this.arr.length;
		}

		if (isSet && id != -1 && this.has(id)) {
			client.id(id);
			client.host(client.host() || false);
			return this.set(client);
		}

		client.id(id);
		client.host(client.host() || false);

		if (client.host()) {
			this.hostId = id;
		}

        this.arr.push(client);
        this.arrIds.push(id);

        return client;
	}

	set(client) {
		this.arr[this.arrIds.indexOf(client.id())] = client;
		return client;
	}

    remove(id) {
        let i = this.arrIds.indexOf(id);
        if (i != -1) {
            this.arr.splice(id, 1);
            this.arrIds.splice(id, 1);
        }
    }

    setHost(id) {
        if (this.has(id)) {
            if (this.hostId > -1) {
                this.get(this.hostId).host(false);
            }

            this.hostId = id;
            let stream = this.get(id);
            stream.host(true);
        }
    }

	host() {
		return this.get(this.hostId);
	}

	export() {
		let clients = [];
        let it = this.iterator();
		while (it.hasNext()) {
			let cl = it.remove();
            clients.push({id: cl.id(), isHost: cl.host()});
        }
        return clients;
    }

    iterator() {
        return new BasicIterator(this.arr, true);
    }
}
