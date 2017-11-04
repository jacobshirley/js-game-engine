let _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

const DEFAULT_UPDATE_RATE = 1000/60;

class World extends GameTimer {
    constructor(timer, renderer, physics, updatePool, controllers) {
        super(timer);

        this.objects = [];

        this.renderer = renderer;
        this.physics = physics;
        this.updatePool = updatePool;
        this.controllers = controllers;

        this.picker = new Picker(this.renderer, this.physics, this.controllers, this.updatePool.myClient);

        this.setRenderFunction(() => {
            for (let obj of this.objects) {
                let body = obj.physicsData.body;
                let mesh = obj.renderData.mesh;
                let mS = body.getMotionState();
                if (mS) {
                    mS.getWorldTransform(_trans);

                    let origin = _trans.getOrigin();
                    let rotation = _trans.getRotation();

                    mesh.position.set(origin.x(), origin.y(), origin.z());
                    mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
                }
            }

            this.renderer.render();
        });

        this.setLogicFunction((frame) => {
            try {
                this.picker.update(frame);
                this.controllers.update(frame);
                this.updatePool.update(frame);
                this.physics.update(this.updateInterval / 1000.0);
            } catch (e) {
                if (e instanceof LockstepQueueError) {
                    console.log("inc delay");
                    this.updateTimer.addDelay(new IncDelay(10, true));
                } else throw e;
            }
        });
    }

    init() {
        this.renderer.init();
        this.physics.init();
    }

    destroy() {
        this.renderer.destroy();
        this.physics.destroy();
    }

    reset(state) {
        let newObjects = [];

        for (let object of this.objects) {
            newObjects.push(object.copy());
        }

        this.removeAll(true);
        this.physics.reset();

        for (let object of newObjects) {
            this.addObject(object);
        }

        if (state)
            this.physics.setAllObjectProps(state);
    }

    addObject(object) {
        object.init(this.physics);

        this.objects.push(object);

        this.renderer.addObject(object);
        this.physics.addObject(object);
    }

    removeAll(destroy) {
        this.physics.removeAll(destroy);
        this.renderer.removeAll();

        this.objects = [];
    }

    getDebugString() {
        return super.getDebugString() + " <br />Net updates: "+this.updatePool.processedUpdates+" <br />Controller updates: "+this.controllers.updates;
    }
}
