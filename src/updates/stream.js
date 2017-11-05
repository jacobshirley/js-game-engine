import BasicIterator from "./iteration.js";

export default class UpdateStream {
	constructor() {
		this.updates = [];
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
