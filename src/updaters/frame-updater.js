class FrameUpdater extends UpdateProcessor {
    constructor(networking, subupdater, checkTick) {
        super(networking);

        this.checkTick = checkTick;

        this.clientId = -1;
        this.lastFrame = -1;

        this.subupdater = subupdater;
    }

    preprocess() {
        this.subupdater.preprocess();
    }

    startProcess(clientId) {
        this.clientId = clientId;
        this.lastFrame = -1;

        this.subupdater.startProcess(clientId);
    }

    process(update) {
        var upd = () => {
            if (this.lastFrame == -1) {
                this.lastFrame = update.frame;
            }

            if (this.lastFrame == update.frame) {
                this.subupdater.process(update);
                return Networking.CONTINUE_DELETE;
            } else {
                if (!this.checkTick)
                    this.lastFrame = update.frame;

                return Networking.BREAK_NOTHING;
            }
        }

        if (!update.frame)
            return Networking.SKIP;

        var cont = this.networking.isHost || !this.checkTick || this.networking.tick == update.frame;
        if (cont) {
            if (this.checkTick && this.clientId != this.networking.id) {
                return upd();
            } else if (!this.checkTick) {
                return upd();
            }
            //console.log(update);
            return Networking.BREAK_DELETE;
        } else {
            return Networking.BREAK_NOTHING;
        }
    }

    endProcess(clientId) {
        this.subupdater.endProcess(clientId);
    }

    postprocess() {
        this.subupdater.postprocess();
    }
}