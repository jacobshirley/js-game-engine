export default class ObjectSynchronizer {
    constructor(updateQueue) {
        this.updateQueue = updateQueue;
        this.tracked = [];
    }

    sync(object) {
        let syncer = object.synchronizer();
        let initData = syncer.init();

        this.tracked.push(syncer);

        this.updateQueue.pushFramed({name: "SYNC_INIT", i: this.tracked.length - 1, data: initData});
    }

    update() {
        if (!this.updateQueue.isHost)
            return;

        let c = 0;
        for (let trackedObj of this.tracked) {
            let syncData = trackedObj.sync();
            if (syncData) {
                this.updateQueue.pushFramed({name: "SYNC_OBJ", i: c++, data: syncData});
            }
        }
    }

    process(update) {
        if (this.updateQueue.isHost)
            return;

        if (update.name == "SYNC_INIT") {
            let syncer = this.tracked[update.i];
            syncer.init(update.data);
        } else if (update.name == "SYNC_OBJ") {
            let syncer = this.tracked[update.i];
            syncer.sync(update.data);
        }
    }
}
