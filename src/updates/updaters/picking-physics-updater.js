class PickingPhysicsUpdater extends UpdateProcessor {
    constructor(pool, physics, timer) {
        super(pool);

        this.clientId = -1;
        this.physics = physics;
        this.timer = timer;

        this.handles = [];

        for (let i = 0; i < 100; i++)
            this.handles.push(null);
    }

    startProcess(clientId) {
        this.clientId = clientId;
    }

    process(update) {
        if (update.name == "CREATE") {
            let body = this.physics.objects[update.index];
            let pos = update.data;

            this.handles[this.clientId] = this.physics.createJoint({type:"point2point",
                                                   body1: body,
                                                   position: pos});

            console.log(update.name);
            //console.log(update.name+": "+update.frame+", "+this.timer.tick);

            this.physics.addObject(this.handles[this.clientId]);
        } else if (update.name == "MOVE") {
            //console.log(update.name+": "+update.frame+", "+this.timer.tick);
           // console.log("2: "+update.frame);
            let intersection = update.data;
            this.handles[this.clientId].setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
        } else if (update.name == "DESTROY") {
            let handle = this.handles[this.clientId];

            this.physics.removeObject(handle);
            Ammo.destroy(handle);

            this.handles[this.clientId] = null;
        } else if (update.name == "RESET_ALL") {
            this.physics.setAllObjectProps(update.props);
        }
    }
}
