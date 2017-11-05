import Block from "../objects/block.js";

let _trans3 = new Ammo.btTransform();

export default class Physics {
    constructor() {
        this.dynamicsWorld = null;

        this.objects = [];
    }

    init() {
    	this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
    }

    destroy() {
    	Ammo.destroy(this.collisionConfiguration);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.overlappingPairCache);
        Ammo.destroy(this.solver);
        Ammo.destroy(this.dynamicsWorld);

        this.objects.forEach(function(obj) {
        	Ammo.destroy(obj);
        });

        this.objects = [];
    }

    reset(keepOldObjects) {
        this.destroy();
        this.init();
    }

    addObject(obj) {
        if (obj instanceof Block) {
        	this.objects.push(obj.physicsData.body);

        	this.dynamicsWorld.addRigidBody(obj.physicsData.body);
        } else if (obj instanceof Ammo.btPoint2PointConstraint) {
            this.dynamicsWorld.addConstraint(obj);
        }
    }

    createBlock(props) {
        let size = props.size||{width:0, height:0, length:0};
        let position = props.position||{x: 0, y: 0, z: 0};
        let rotation = props.rotation||{x: 0, y: 0, z: 0};
        let mass = props.mass||0;

        let size2 = new Ammo.btVector3(size.width, size.height, size.length);
        let sideShape = new Ammo.btBoxShape(size2);
        sideShape.setMargin(0.05);

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

        body.setDamping(0, 0.2);
        body.setActivationState(4);
        body.setFriction(0.8);

        return body;
    }

    createSphere(props) {
    }

    createCustomShape(props) {
    }

    createJoint(props) {
        let type = props.type||"point2point";
        let pos = props.position;
        let body1 = props.body1;
        let body2 = props.body2;

        if (type == "point2point") {
            return new Ammo.btPoint2PointConstraint(body1, new Ammo.btVector3(pos.x, pos.y, pos.z));
        }
    }

    removeObject(obj) {
        if (obj instanceof Block) {
            this.objects.splice(this.objects.indexOf(obj.physicsData.body), 1);

            this.dynamicsWorld.removeRigidBody(obj.physicsData.body);
        } else if (obj instanceof Ammo.btPoint2PointConstraint) {
            this.dynamicsWorld.removeConstraint(obj);
        }
    }

    setAllObjectProps(props) {
    	let objects = this.objects;
    	for (let prop of props) {
            let body = objects[prop.index];

            let aVel = prop.aVel;
            let lVel = prop.lVel;

            let pos = prop.pos;
            let rot = prop.rot;

            _trans3 = body.getWorldTransform();
            //body.getMotionState().getWorldTransform(_trans3);

            _trans3.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            let rows = rot;
            let matrix = new Ammo.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z,
                                          rows[1].x, rows[1].y, rows[1].z,
                                          rows[2].x, rows[2].y, rows[2].z);

            _trans3.setBasis(matrix);

            body.setAngularVelocity(new Ammo.btVector3(aVel.x, aVel.y, aVel.z));
            body.setLinearVelocity(new Ammo.btVector3(lVel.x, lVel.y, lVel.z));
    	}
    }

    getObjectProps(index) {
        let body = this.objects[index];
        let aVel = body.getAngularVelocity();
        let lVel = body.getLinearVelocity();

        _trans3 = body.getWorldTransform();

        let origin = _trans3.getOrigin();
        let rotation = _trans3.getRotation();

        let basis = _trans3.getBasis();
        let rows = [];
        for (let i = 0; i < 3; i++) {
            let row = basis.getRow(i);
            rows.push({x: row.x(), y: row.y(), z: row.z()});
        }

        let pos = {x: origin.x(), y: origin.y(), z: origin.z()};
        let rot = rows;

        let result = {index: index,
                         pos: pos,
                         rot: rot,
                         aVel: {x: aVel.x(), y: aVel.y(), z: aVel.z()},
                         lVel: {x: lVel.x(), y: lVel.y(), z: lVel.z()}
                     };

        return result;
    }

    getAllObjectProps() {
    	let props = [];
    	let c = 0;

    	for (let body of this.objects) {
    		props.push(this.getObjectProps(c));
    		c++;
    	}

    	return props;
    }

    removeAll(destroy) {
        let world = this.dynamicsWorld;
        for (let obj of this.objects) {
            world.removeRigidBody(obj);
            if (destroy)
                Ammo.destroy(obj);
        }
        this.objects = [];
    }

    update(speed) {
        this.dynamicsWorld.stepSimulation(speed, 7);
    }
}
