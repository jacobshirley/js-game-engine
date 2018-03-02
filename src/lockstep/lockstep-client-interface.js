import EventEmitter from "../base/shims/events.js";
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

    getLocalClient() {}

    getClients() {
        return this.clients;
    }

    flush() {}
    update() {}
}
