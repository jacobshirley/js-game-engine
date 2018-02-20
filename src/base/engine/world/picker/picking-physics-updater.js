import UpdateProcessor from "../../updates/update-processor.js";

export default class PickingPhysicsUpdater extends UpdateProcessor {
    constructor(pool, physics) {
        super(pool);

        this.physics = physics;

        this.handles = [];

        for (let i = 0; i < 100; i++)
            this.handles.push(null);

        this.us = 0;
    }

    process(update) {
        if (update.name == "CREATE") {
            this.us++;

            let body = this.physics.objects[update.index];
            let pos = update.data;

            this.handles[this.__clId] = this.physics.createJoint({type:"point2point",
                                                   body1: body,
                                                   position: pos});

            console.log(update.name+" from "+update.__clId);
            //console.log(update.name+": "+update.frame+", "+this.timer.tick);

            this.physics.addObject(this.handles[this.__clId]);
        } else if (update.name == "MOVE") {
            this.us++;

            //console.log(update.name+": "+update.frame+", "+this.timer.tick);
           // console.log("2: "+update.frame);
            let intersection = update.data;
            this.handles[this.__clId].setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
        } else if (update.name == "DESTROY") {
            this.us++;

            let handle = this.handles[this.__clId];

            this.physics.removeObject(handle);
            Ammo.destroy(handle);

            this.handles[this.__clId] = null;
        }
    }
}
