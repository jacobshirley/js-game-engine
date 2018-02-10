import {ClientUpdateStream} from "../../engine/updates/streamed/client-stream.js";

export default class ServerClient extends ClientUpdateStream {
    constructor(ws, id, isHost) {
        super(id, isHost);
        this.ws = ws;
    }

    send(data) {
        return this.ws.send(JSON.stringify(data));
    }
}
