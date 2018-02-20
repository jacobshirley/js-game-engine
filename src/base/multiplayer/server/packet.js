import BasicIterator from "../../engine/updates/iteration.js";
import UpdateStream from "../../engine/updates/streamed/stream.js";

export default class Packet extends UpdateStream {
    constructor(from, string) {
        super();

        this.from = from;
        this.string = string;
    }

    decode() {
        this.updates = JSON.parse(this.string);
    }

    json() {
        return {server: this.from === 0, from: this.from, data: this.string};
    }

    iterator() {
        return new BasicIterator(this.updates, true);
    }
}
