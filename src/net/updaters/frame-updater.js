class FrameUpdater extends UpdateProcessor {
    constructor(networking, subupdaters, disablePastUpdates) {
        super(networking);

        this.clientId = -1;
        this.lastFrame = -1;

        this.subupdaters = subupdaters;

        this.disablePastUpdates = disablePastUpdates;
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
        if (!update.frame)
            return Networking.SKIP;
        
        let upd = () => {
            if (this.lastFrame == -1) {
                this.lastFrame = update.frame;
            }

            //console.log("doing "+this.networking.tick);
            if (this.lastFrame == update.frame) {
                for (let subupdater of this.subupdaters)
                    subupdater.process(update);
                return Networking.CONTINUE_DELETE;
            } else {
                console.log(update);
                return Networking.BREAK_NOTHING;
            }
        }

        //!this.disablePastUpdates || 
        let cont = this.networking.isHost || this.networking.tick == update.frame;
        if (cont) {
            let check = true;//this.clientId != this.networking.id;// || this.networking.isHost;
            /*if (this.disablePastUpdates) {
                return upd();
            } else if (!this.disablePastUpdates) {
                //console.log("SDFSDF");
                return upd();
            }*/
            return upd();
            //return Networking.BREAK_DELETE;
        } else {
            //console.log("NOTHING");
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