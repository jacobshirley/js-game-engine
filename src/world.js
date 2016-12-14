let _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

class World {
    constructor(renderer, physics, networking) {
        this.objects = [];
        this.renderer = renderer;
        this.physics = physics;
        this.networking = networking;

        this.picker = new Picker(this.renderer, this.physics);

        this.clock = new THREE.Clock();
        this.clock.start();

        this.time = 0;
        this.renderTime = 0;
        this.fps = 0;
        this.tempFPS = 0;

        this.pps = 0;
        this.tempPPS = 0;
    }

    init() {
        this.renderer.init();
        this.physics.init();
    }

    destroy() {
        this.renderer.destroy();
        this.physics.destroy();
    }

    addObject(object) {
        this.objects.push(object);
        
        this.renderer.addObject(object);
        this.physics.addObject(object);
    }

    removeAll(destroy) {
        this.physics.removeAll(destroy);
        this.renderer.removeAll();

        this.objects = [];
    }

    update() {
        let dt = 1/60;

        if (this.networking.update()) {
            while (this.renderTime >= dt) {
                this.picker.update();
                
                this.physics.update(dt);

                this.renderTime -= dt;
                this.tempPPS++;
            }
        }

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

        let delta = this.clock.getDelta();
        this.renderTime += delta;
        this.time += delta;
        this.tempFPS++;

        if (this.time >= 1) {
            this.time = 0;
            this.fps = this.tempFPS;
            this.tempFPS = 0;

            this.pps = this.tempPPS;
            this.tempPPS = 0;
        }
    }
}