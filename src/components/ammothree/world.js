import Ammo from "./ammo/ammo.js";

let _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

export default class World {
    constructor(engine, renderer, physics) {
        this.objects = [];

        this.components = [physics];
        this.renderTimer = engine.renderTimer;
        this.queue = engine.queue;
        this.renderer = renderer;
        this.physics = physics;
    }

    destroy() {
        this.physics.destroy();
        this.renderer.destroy();

        this.objects = [];
    }

    getWorldState() {
        let states = [];

        for (let comp of this.components) {
            let sM = comp.getStateManager();
            if (sM)
                states.push(sM.state());
        }

        return states;
    }

    setWorldState(state) {
        let i = 0;
        for (let comp of this.components) {
            let sM = comp.getStateManager();
            if (sM) {
                sM.setState(state[i]);
                i++;
            }
        }
    }

    addComponent(component) {
        this.components.push(component);
    }

    addObject(gameObj) {
        this.physics.addObject(gameObj.physicsObj);
        if (gameObj.renderObj)
            this.renderer.addObject(gameObj.renderObj);

        if (this.objects.indexOf(gameObj) == -1)
            this.objects.push(gameObj);
    }

    updateObject(obj) {
        return this.addObject(obj);
    }

    removeObject(gameObj) {
        this.physics.addObject(gameObj.physicsObj);
        if (gameObj.renderObj)
            this.renderer.addObject(gameObj.renderObj);

        this.objects.splice(this.objects.indexOf(gameObj), 1);
    }

    removeAll(destroy) {
        this.physics.removeAll(destroy);
        this.renderer.removeAll();

        this.objects = [];
    }

    getDebugString() {
        return "<br />Net updates: " + this.queue.processedUpdates;
    }

    render() {
        //console.log(this.objects.length);
        for (let obj of this.objects) {
            let body = obj.physicsObj;
            let mesh = obj.renderObj;
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

    update(frame) {
        this.physics.update(this.renderTimer.logicInterval / 1000.0);
    }
}
