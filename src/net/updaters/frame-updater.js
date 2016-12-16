class FrameUpdater extends UpdateProcessor {
    constructor(networking, subupdaters, checkTick) {
        super(networking);

        this.checkTick = checkTick;

        this.clientId = -1;
        this.lastFrame = -1;

        this.subupdaters = subupdaters;
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
        
        var upd = () => {
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

        var cont = this.networking.isHost || !this.checkTick || this.networking.tick == update.frame;
        if (cont) {
            if (this.checkTick && this.clientId != this.networking.id) {
                return upd();
            } else if (!this.checkTick) {
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