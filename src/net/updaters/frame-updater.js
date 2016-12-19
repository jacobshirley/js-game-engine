class FrameUpdater extends UpdateProcessor {
    constructor(networking, subupdaters, allowPastUpdates) {
        super(networking);

        this.clientId = -1;
        this.lastFrame = -1;

        this.subupdaters = subupdaters;

        this.allowPastUpdates = allowPastUpdates;
    }

    preprocess() {
        for (let subupdater of this.subupdaters)
            subupdater.preprocess();
    }

    startProcess(clientId) {
        this.clientId = clientId;
        this.lastFrame = -1;

        for (let subupdater of this.subupdaters)
            subupdater.startProcess(clientId);
    }

    process(update) {
        //console.log(update);
        if (!update.frame)
            return Networking.SKIP;
        
        let upd = () => {
            if (this.lastFrame == -1) {
                this.lastFrame = update.frame;
            }

            if (this.lastFrame == update.frame) {
                for (let subupdater of this.subupdaters)
                    subupdater.process(update);
                return Networking.CONTINUE_DELETE;
            } else {
                return Networking.BREAK_NOTHING;
            }
        }

        let cont = this.networking.isHost || !this.allowPastUpdates || this.networking.tick == update.frame;
        if (cont) {
            let check = this.clientId != this.networking.id || this.networking.isHost;
            if (this.allowPastUpdates && check) {
                return upd();
            } else if (!this.allowPastUpdates) {
                return upd();
            }
            return Networking.BREAK_DELETE;
        } else {
            return Networking.BREAK_NOTHING;
        }
    }

    endProcess(clientId) {
        for (let subupdater of this.subupdaters)
            subupdater.endProcess(clientId);
    }

    postprocess() {
        for (let subupdater of this.subupdaters)
            subupdater.postprocess();
    }

    modify(update) {
    }
}