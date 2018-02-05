import Client from "../engine/updates/client.js";
import {ClientList} from "../engine/updates/client.js";
import BasicIterator from "../engine/updates/iteration.js";

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
