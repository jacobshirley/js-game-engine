import {ClientUpdateStream} from "../../base/updates/streamed/client-stream.js";

const OPEN = 1;

export default class ServerClient extends ClientUpdateStream {
    constructor(ws, id, isHost) {
        super(id, isHost);
        this.ws = ws;
    }

    get connected() {
        return this.ws.readyState == OPEN;
    }

    send(data) {
        return this.ws.send(JSON.stringify(data));
    }
}
