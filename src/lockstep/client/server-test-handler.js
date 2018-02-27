import LockstepClientInterface from "../lockstep-client-interface.js";
import {ClientList} from "../../base/updates/client.js";
import {LocalClientUpdateStream, ClientUpdateStream} from "../../base/updates/streamed/client-stream.js";

export default class ServerTestHandler extends LockstepClientInterface {
    constructor() {
        super();

        this.local = new LocalClientUpdateStream(null, 0, true);
        this.local.push({name: "INIT"}, false);

        this.clients.push(this.local);
        this.clients.setHost(0);

        this.connected = true;
        this.emit("connected", this.local);
    }

    getLocalClient() {
        return this.local;
    }

    getClients() {
        return this.clients;
    }

    flush() {}

    update(frame) {
        this.local.update(frame);
    }
}
