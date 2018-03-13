import EventEmitter from "../shims/events.js";
import {ClientList} from "../base/updates/client.js";

export default class LockstepClientInterface extends EventEmitter {
    constructor(clients) {
        super();

        this.clients = clients || new ClientList();
    }

    recv() {
		let clients = this.clients.iterator();

		while (clients.hasNext()) {
			clients.remove().recv();
		}
	}

    clear() {
		for (let cl of this.clients.arr) {
			cl.clear();
		}
	}

    getLocalClient() {}

    getClients() {
        return this.clients;
    }

    flush() {}
    update() {}
}
