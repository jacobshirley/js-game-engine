class NetHandler extends EventEmitter {
    constructor() {

    }

    process(update) {
        if (update.name == "CONNECTED") {
            this.emit("connected", )
        }
    }
}
