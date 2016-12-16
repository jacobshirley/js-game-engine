let INPUT_DELAY = 5; // in ticks
let RESET_DELAY = 100; // in ticks

class PhysicsWorldUpdater extends UpdateProcessor {
    constructor(networking, world, netDelay) {
        super(networking);

        this.world = world;
        this.physics = this.world.physics;
        this.netDelay = netDelay;

        this.initUpdate = null;
        this.initialised = false;
    }

    reset(state) {
        let newObjects = [];

        for (let object of this.world.objects) {
            newObjects.push(object.copy());
        }

        this.world.removeAll(true);
        this.physics.reset();

        for (let object of newObjects) {
            this.world.addObject(object);
        }

        if (state)
            this.physics.setAllObjectProps(state);
    }

    process(update) {
        if (update.name == "CONNECTION") {
            if (this.networking.isHost) {
                let p = this.physics.getAllObjectProps();
                this.reset(p);

                this.networking.addUpdate({name: "INIT", target: update.id, startFrame: this.networking.tick, props: p});
            }

            return Networking.CONTINUE_DELETE;
        } else if (update.name == "INIT") {
            this.initUpdate = update;
            if (update.target == this.networking.id) {
                console.log("init");

                let pickingPhysicsUpdater = new PickingPhysicsUpdater(this.networking, this.physics);
                let frameUpdater = new FrameUpdater(this.networking, [pickingPhysicsUpdater], false);
                let serverControlUpdater = new FrameUpdater(this.networking, [new P2PModelUpdater(this.networking, frameUpdater)], true);

                let delay = new Delay(this.netDelay, false);
                delay.on('complete', () => {
                    console.log("COMPLETE");
                    this.world.setTick(this.initUpdate.startFrame);
                    this.reset(this.initUpdate.props);

                    this.initialised = true;
     
                    this.networking.addUpdateProcessor(serverControlUpdater);
                    this.networking.addUpdateProcessor(new FrameLockUpdater(this.networking, 5, 10));
                });

                this.networking.addDelay(delay);
            } else {
                if (!this.networking.isHost) {
                    console.log("init other person");
                    this.networking.setTick(this.initUpdate.startFrame);
                    this.reset(this.initUpdate.props);
                }
            }
            return Networking.CONTINUE_DELETE;
        }

        if (!this.initialised)
            return Networking.CONTINUE_DELETE;

        return Networking.SKIP;
    }
}