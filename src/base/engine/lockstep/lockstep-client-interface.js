import EventEmitter from "../../shims/events.js";
import {ClientList} from "../../engine/updates/client.js";

export default class LockstepClientInterface extends EventEmitter {
    constructor() {
        super();

        this.clients = new ClientList();
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
