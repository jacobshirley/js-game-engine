var _trans3 = new Ammo.btTransform();

class Physics extends Timer {
    constructor() {
        super();
        
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
    	this.objects.push(obj.physicsData.body);

    	this.dynamicsWorld.addRigidBody(obj.physicsData.body);
    }

    createBlock(props) {
        var size = props.size||{width:0, height:0, length:0};
        var position = props.position||{x: 0, y: 0, z: 0};
        var rotation = props.rotation||{x: 0, y: 0, z: 0};
        var mass = props.mass||0;

        var size2 = new Ammo.btVector3(size.width, size.height, size.length);
        var sideShape = new Ammo.btBoxShape(size2);
        sideShape.setMargin(0.05);

        var sideTransform = new Ammo.btTransform();
        sideTransform.setIdentity();
        sideTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        var quat = new Ammo.btQuaternion();
        quat.setEulerZYX(rotation.z, rotation.y, rotation.x);
        sideTransform.setRotation(quat);

        var isDynamic = mass !== 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic)
            sideShape.calculateLocalInertia(mass, localInertia);

        var myMotionState = new Ammo.btDefaultMotionState(sideTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        body.setDamping(0, 0.2);
        body.setActivationState(4);
        body.setFriction(0.6);

        return body;
    }

    createSphere(props) {
    }

    createCustomShape(props) {
    }

    createJoint(props) {
    }

    setAllObjectProps(props) {
    	var objects = this.objects;
    	props.forEach(function(prop) {
            var body = objects[prop.index];

            var aVel = prop.aVel;
            var lVel = prop.lVel;

            var pos = prop.pos;
            var rot = prop.rot;

            _trans3 = body.getWorldTransform();
            //body.getMotionState().getWorldTransform(_trans3);  
            
            _trans3.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            var rows = rot;
            var matrix = new Ammo.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z,
                                          rows[1].x, rows[1].y, rows[1].z,
                                          rows[2].x, rows[2].y, rows[2].z);

            _trans3.setBasis(matrix);

            body.setAngularVelocity(new Ammo.btVector3(aVel.x, aVel.y, aVel.z));
            body.setLinearVelocity(new Ammo.btVector3(lVel.x, lVel.y, lVel.z));
    	});
    }

    getObjectProps(index) {
        var body = this.objects[index];
        var aVel = body.getAngularVelocity();
        var lVel = body.getLinearVelocity();

        _trans3 = body.getWorldTransform();

        var origin = _trans3.getOrigin();
        var rotation = _trans3.getRotation();

        var basis = _trans3.getBasis();
        var rows = [];
        for (var i = 0; i < 3; i++) {
            var row = basis.getRow(i);
            rows.push({x: row.x(), y: row.y(), z: row.z()});
        }

        var pos = {x: origin.x(), y: origin.y(), z: origin.z()};
        var rot = rows;

        var result = {index: index, 
                         pos: pos,
                         rot: rot,
                         aVel: {x: aVel.x(), y: aVel.y(), z: aVel.z()}, 
                         lVel: {x: lVel.x(), y: lVel.y(), z: lVel.z()}
                     };

        return result;
    }

    getAllObjectProps() {
    	var props = [];
    	var c = 0;
        var _this = this;

    	this.objects.forEach(function(body) {
    		props.push(_this.getObjectProps(c));
    		c++;
    	});

    	return props;
    }

    removeAll(destroy) {
        var world = this.dynamicsWorld;
        this.objects.forEach(function (obj) {
            world.removeRigidBody(obj);
            if (destroy)
                Ammo.destroy(obj);
        });
        this.objects = [];
    }

    update(speed) {
        return super.update(() => {
            this.dynamicsWorld.stepSimulation(speed, 7);
        });
    }
}