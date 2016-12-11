class PhysicsWorldUpdater extends UpdateProcessor {
    constructor(networking, world) {
        super(networking);
        this.world = world;
        this.physics = this.world.physics;
        this.initUpdate = null;
        this.initialised = false;
    }

    reset() {
        //TODO reset the physics simulation state
    }

    process(update) {
        if (update.name == "CONNECTION") {
            var p = this.physics.getAllObjectProps();
            reset(p);

            if (this.networking.isHost) {
                this.networking.addUpdate({name: "INIT", target: update.id, startFrame: this.networking.tick, props: p});
            }

            return Networking.CONTINUE_DELETE;
        } else if (update.name == "INIT") {
            if (update.target == this.networking.id) {
                console.log("init");
                this.initialised = true;

                this.initUpdate = update;

                var pickingPhysicsUpdater = new PickingPhysicsUpdater(this.networking, this.physics);
                var frameUpdater = new FrameUpdater(this.networking, [pickingPhysicsUpdater], false);
                var serverControlUpdater = new FrameUpdater(networking, [new P2PModelUpdater(this.networking, frameUpdater)], true);

                var delay = new Delay(DELAY, true);
                delay.on('finished', () => {
                    this.networking.setTick(this.initUpdate.startFrame);
                    reset(this.initUpdate.props);
                    this.networking.addUpdateProcessor(serverControlUpdater);
                });
                this.networking.addDelay(delay);
            }
            return Networking.CONTINUE_DELETE;
        }

        if (!this.initialised)
            return Networking.CONTINUE_DELETE;

        return Networking.SKIP;
    }
}