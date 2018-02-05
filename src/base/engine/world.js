import GameTimer from "./timing/game-timer.js";
import Picker from "./picker.js";
import Ammo from "../shims/ammo.js";
import ObjectSynchronizer from "./sync/object-synchronizer.js";

let _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

const DEFAULT_UPDATE_RATE = 1000/60;

export default class World {
    constructor(game, renderer, physics) {
        this.objects = [];

        this.renderTimer = game.renderTimer;
        this.queue = game.queue;
        this.controllers = game.controllers;
        this.renderer = renderer;
        this.physics = physics;

        this.synchronizer = new ObjectSynchronizer();
    }

    render() {
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
    }

    logic(frame) {
        this.physics.update(this.renderTimer.updateInterval / 1000.0);
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
        object.initRenderer(this.renderer);

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
        return "<br />Net updates: " + this.updatePool.processedUpdates + " <br />Controller updates: " + this.controllers.updates;
    }
}
