import EventEmitter from "../shims/events.js";
import {ClientList} from "../engine/updates/client.js";

export default class Multiplayer extends EventEmitter {
    constructor() {
        super();

        this.clients = new ClientList();

        this.localUpdates = [];
        this.queueR = [];
    }

    push(update) {
        //this.localUpdates.push(update);
    }

    recv() {
		let clients = this.clients.iterator();

		while (clients.hasNext()) {
			clients.remove().recv();
		}
	}

    queueRemove(client) {
        this.queueR.push(client);
    }

    getLocalClient() {}
    
    getClients() {
        return this.clients;
    }

    flush() {}
    update() {}
}
