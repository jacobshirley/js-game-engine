class PickingPhysicsUpdater extends UpdateProcessor {
    constructor(networking, physics) {
        super(networking);
        this.physics = physics;
        this.handle = null;
    }

    process(update) {
        console.log(update);
        if (update.name == "CREATE") {
            var body = this.physics.objects[update.index];
            var pos = update.data;

            this.handle = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(pos.x, pos.y, pos.z));
            this.physics.dynamicsWorld.addConstraint(this.handle);
        } else if (update.name == "MOVE") {
            var intersection = update.data;
            this.handle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
        } else if (update.name == "DESTROY") {
            this.physics.dynamicsWorld.removeConstraint(this.handle);
            Ammo.destroy(this.handle);

            this.handle = null;
        } else if (update.name == "RESET_ALL") {
            this.physics.setAllObjectProps(update.props);
        }

        return Networking.CONTINUE_DELETE;
    }
}