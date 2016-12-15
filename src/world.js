let _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

class World extends Timer {
    constructor(renderer, physics, networking) {
        super();

        this.objects = [];
        this.renderer = renderer;
        this.physics = physics;
        this.networking = networking;

        this.networking.tether(this);

        this.picker = new Picker(this.renderer, this.physics);

        this.clock = new THREE.Clock();
        this.clock.start();

        this.time = 0;
        this.renderTime = 0;
        this.physicsTime = 0;
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
        return super.update(() => {
            let dt = 1/60;

            console.log(this.time+", "+this.networking.time);

            if (this.networking.update()) {
                while (this.physicsTime >= dt) {
                    this.picker.update();
                    
                    this.physics.update(dt);

                    this.physicsTime -= dt;
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
            this.physicsTime += delta;
            this.time += delta;
            this.tempFPS++;

            if (this.time >= 1) {
                this.time = 0;
                this.fps = this.tempFPS;
                this.tempFPS = 0;

                this.pps = this.tempPPS;
                this.tempPPS = 0;
            }

            return true;
        });
    }
}