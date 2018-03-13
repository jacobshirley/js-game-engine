import Ammo from "./ammo.js";
import Component from "../../component.js";

export default class Physics extends Component {
    constructor(dynamicsWorld) {
        super("Ammo Physics");

        this.dynamicsWorld = dynamicsWorld;
        this.shapes = [];
        this.objects = [];
        this.constraints = [];
    }

    init() {
        if (!this.dynamicsWorld) {
        	this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
            this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
            this.overlappingPairCache = new Ammo.btDbvtBroadphase();
            this.solver = new Ammo.btSequentialImpulseConstraintSolver();
            this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
            this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
        }
    }

    destroy() {
        this.removeAll(true);

    	Ammo.destroy(this.collisionConfiguration);
        this.collisionConfiguration = null;
        Ammo.destroy(this.dispatcher);
        this.dispatcher = null;
        Ammo.destroy(this.overlappingPairCache);
        this.overlappingPairCache = null;
        Ammo.destroy(this.solver);
        this.solver = null;
        Ammo.destroy(this.dynamicsWorld);
        this.dynamicsWorld = null;
    }

    setGravity(grav) {
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, grav, 0));
    }

    getBodyID(body) {
        return this.objects.indexOf(body);
    }

    reset() {
        this.destroy();
        this.init();
    }

    createBlock(def) {
        let size = def.size||{width:0, height:0, length:0};
        let position = def.position||{x: 0, y: 0, z: 0};
        let rotation = def.rotation||{x: 0, y: 0, z: 0};
        let margin = def.margin||0.04;
        let mass = def.mass||0;
        let damping = def.damping||0.9;
        let friction = def.friction||0.5;
        let sideShape = def.shape;

        if (typeof sideShape == "undefined") {
            let size2 = new Ammo.btVector3(size.width, size.height, size.length);
            sideShape = new Ammo.btBoxShape(size2);
            sideShape.setMargin(margin);
        }

        if (this.shapes.indexOf(sideShape) == -1) {
            this.shapes.push(sideShape);
        }

        let sideTransform = new Ammo.btTransform();
        sideTransform.setIdentity();
        let v = new Ammo.btVector3(position.x, position.y, position.z);
        sideTransform.setOrigin(v);

        let quat = new Ammo.btQuaternion();
        quat.setEulerZYX(rotation.z, rotation.y, rotation.x);
        sideTransform.setRotation(quat);

        let isDynamic = mass !== 0;
        let localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic)
            sideShape.calculateLocalInertia(mass, localInertia);

        let myMotionState = new Ammo.btDefaultMotionState(sideTransform);
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);

        body.setDamping(0, damping);
        body.setFriction(friction);
        body.setActivationState(4);

        return body;
    }

    createSphere(def) {
        return Physics.createSphere(def);
    }

    static createSphere(def) {
        let size = def.size||{radius: 1};
        let position = def.position||{x: 0, y: 0, z: 0};
        let rotation = def.rotation||{x: 0, y: 0, z: 0};
        let margin = def.margin||0.04;
        let mass = def.mass||0;
        let damping = def.damping||0.9;
        let friction = def.friction||0.5;

        let sideShape = new Ammo.btSphereShape(size.radius);
        sideShape.setMargin(margin);

        let sideTransform = new Ammo.btTransform();
        sideTransform.setIdentity();
        sideTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        let quat = new Ammo.btQuaternion();
        quat.setEulerZYX(rotation.z, rotation.y, rotation.x);
        sideTransform.setRotation(quat);

        let isDynamic = mass !== 0;
        let localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic)
            sideShape.calculateLocalInertia(mass, localInertia);

        let myMotionState = new Ammo.btDefaultMotionState(sideTransform);
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);

        body.setDamping(0, damping);
        body.setFriction(friction);
        body.setActivationState(4);

        return body;
    }

    createCustomShape(def) {
        return Physics.createCustomShape(def);
    }

    static createCustomShape(def) {
    }

    createConstraint(def) {
        return Physics.createConstraint(def);
    }

    static createConstraint(def) {
        let type = def.type||"point2point";
        let pos = def.position;
        let body1 = def.body1;
        let body2 = def.body2;

        if (type == "point2point") {
            return new Ammo.btPoint2PointConstraint(body1, new Ammo.btVector3(pos.x, pos.y, pos.z));
        }
    }

    addObject(obj) {
        if (obj instanceof Ammo.btRigidBody && this.objects.indexOf(obj) == -1) {
            this.objects.push(obj);

            this.dynamicsWorld.addRigidBody(obj);
        } else if (obj instanceof Ammo.btTypedConstraint && this.constraints.indexOf(obj) == -1) {
            this.constraints.push(obj);

            this.dynamicsWorld.addConstraint(obj);
        }
    }

    updateObject(obj) {
        return this.addObject(obj);
    }

    removeObject(obj) {
        if (obj instanceof Ammo.btRigidBody) {
            this.objects.splice(this.objects.indexOf(obj), 1);

            this.dynamicsWorld.removeRigidBody(obj);
        } else if (obj instanceof Ammo.btPoint2PointConstraint) {
            this.constraints.splice(this.constraints.indexOf(obj), 1);

            this.dynamicsWorld.removeConstraint(obj);
        }
    }

    removeAll(destroy) {
        while (this.shapes.length > 0) {
            Ammo.destroy(this.shapes.shift());
        }

        let world = this.dynamicsWorld;
        for (let obj of this.objects) {
            if (destroy) {
                Ammo.destroy(obj.getMotionState());
            }
            world.removeRigidBody(obj);
            if (destroy) {
                Ammo.destroy(obj);
            }
        }

        for (let obj of this.constraints) {
            world.removeConstraint(obj);
            if (destroy)
                Ammo.destroy(obj);
        }

        this.objects = [];
        this.constraints = [];
    }

    setObjectState(body, state) {
        let aVel = state.aVel;
        let lVel = state.lVel;

        let pos = state.pos;
        let rot = state.rot;

        let trans = body.getWorldTransform();
        let o = new Ammo.btVector3(pos.x, pos.y, pos.z);
        trans.setOrigin(o);

        let rows = rot;
        let matrix = new Ammo.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z,
                                          rows[1].x, rows[1].y, rows[1].z,
                                          rows[2].x, rows[2].y, rows[2].z);

        trans.setBasis(matrix);

        let v = new Ammo.btVector3(aVel.x, aVel.y, aVel.z);
        let lv = new Ammo.btVector3(lVel.x, lVel.y, lVel.z);
        body.setAngularVelocity(v);
        body.setLinearVelocity(lv);

    }

    getObjectState(body) {
        let aVel = body.getAngularVelocity();
        let lVel = body.getLinearVelocity();

        let trans = body.getWorldTransform();

        let origin = trans.getOrigin();
        let rotation = trans.getRotation();

        let basis = trans.getBasis();
        let rows = [];
        for (let i = 0; i < 3; i++) {
            let row = basis.getRow(i);
            rows.push({x: row.x(), y: row.y(), z: row.z()});
        }

        let pos = {x: origin.x(), y: origin.y(), z: origin.z()};
        let rot = rows;

        let result = {pos,
                      rot,
                      aVel: {x: aVel.x(), y: aVel.y(), z: aVel.z()},
                      lVel: {x: lVel.x(), y: lVel.y(), z: lVel.z()}
                     };

        return result;
    }

    getConstraintState(constraint) {
        let pivotA = constraint.getPivotInA();
        let pivotB = constraint.getPivotInB();
        let i = this.getBodyID(constraint.getRigidBodyA());
        let j = this.getBodyID(constraint.getRigidBodyB());

        return {i, j,
                a: {x: pivotA.x(), y: pivotA.y(), z: pivotA.z()},
                b: {x: pivotB.x(), y: pivotB.y(), z: pivotB.z()}
               };
    }

    getBodyID(body) {
        return this.objects.indexOf(body);
    }

    setConstraintState(constraint, state) {

    }

    state() {
        let states = [];
        let i = 0;
        for (let o of this.objects) {
            let object = o;
            let st = this.getObjectState(object);

            states.push({type: "body", index: i, state: st});

            i++;
        }

        i = 0;

        for (let o of this.constraints) {
            let object = o;
            if (object instanceof Ammo.btPoint2PointConstraint) {
                let st = this.getConstraintState(object);
                states.push({type: "p2p-constraint", index: i, state: st});
            }
            i++;
        }

        return states;
    }

    setState(states) {
        for (let state of states) {
            if (state.type == "body") {
                this.setObjectState(this.objects[state.index], state.state);
            } else if (state.type == "p2p-constraint") {
                this.setConstraintState(this.constraints[state.index], state.state);
            }
        }
    }

    getStateManager() {
        return this;
    }

    update(speed) {
        this.dynamicsWorld.stepSimulation(speed, 7);
    }
}
