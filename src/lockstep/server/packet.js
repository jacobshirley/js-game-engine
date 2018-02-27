import BasicIterator from "../../base/updates/iteration.js";
import UpdateStream from "../../base/updates/streamed/stream.js";

export default class Packet extends UpdateStream {
    constructor(from, string, server) {
        super();

        this.from = from;
        this.string = string;
        this.server = typeof server == "undefined" ? false : server;
    }

    decode() {
        this.updates = JSON.parse(this.string);
    }

    json() {
        return {server: this.server, from: this.from, data: this.string};
    }

    iterator() {
        return new BasicIterator(this.updates, true);
    }
}
