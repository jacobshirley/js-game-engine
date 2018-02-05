import EventEmitter from "../shims/events.js";

export default class Multiplayer extends EventEmitter {
    constructor() {
        super();
        this.localUpdates = [];
    }

    push(update) {
        this.localUpdates.push(update);
    }

    getLocalClient() {}
    getClients() {}
    flush() {}
    update() {}
}
