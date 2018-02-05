import {ClientUpdateStream} from "../client-stream.js";

export default class ServerClient extends ClientUpdateStream {
    constructor(ws, id, isHost) {
        super(id, isHost);
        this.ws = ws;
    }

    send(data) {
        try {
            return this.ws.send(JSON.stringify(data));
        } catch (e) {
            
        }
    }
}
