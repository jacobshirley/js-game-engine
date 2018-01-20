class Server {
    constructor(...params) {
        this.updateQueue = createUpdateQueue(...params);
    }

    createUpdateQueue(...params) {
        return null;
    }

    update() {

    }
}

class LockstepServer extends Server {
    constructor(...params) {
        super(...params);
    }

    createUpdateQueue(connection) {
        return new LockstepUpdateQueue(connection);
    }

    update() {

    }
}

class TestSynchronizer {
    constructor(object, physics) {
        this.object = object;
        this.physics = physics;
    }

    init(data) {
        if (data) {
            this.objects.props = data.props;
            this.physics.setObjectProps(this.object.physicsData.body, data.physics);
        } else
            return {props: this.object.props, physics: this.physics.getObjectProps(this.object.physicsData.body)};
    }

    sync() {
        return null;
    }

    destroy() {

    }
}

class ObjectSynchronizer {
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
        let c = 0;
        for (let trackedObj of this.tracked) {
            let syncData = trackedObj.sync();
            if (syncData) {
                this.updateQueue.pushFramed({name: "SYNC_OBJ", i: c, data: syncData});
            }
            c++;
        }
    }

    process(update) {
        if (this.updateQueue.isHost)
            return;

        if (update.name == "SYNC_INIT") {
            
        } else if (update.name == "SYNC_OBJ") {

        }
    }
}
