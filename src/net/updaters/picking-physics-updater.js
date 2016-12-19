class PickingPhysicsUpdater extends UpdateProcessor {
    constructor(networking, physics) {
        super(networking);

        this.clientId = -1;
        this.physics = physics;
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

            let handle = this.handles[this.clientId] = this.physics.createJoint({type:"point2point", 
                                                   body1: body, 
                                                   position: pos});

            this.physics.addObject(handle);
        } else if (update.name == "MOVE") {
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

        return Networking.CONTINUE_DELETE;
    }
}