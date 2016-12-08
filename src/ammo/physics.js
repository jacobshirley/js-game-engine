function Physics() {
	this.dynamicsWorld = null;

	this.objects = [];

	//set gravity
	//get gravity
	//
	//add object
	//remove object
	//
	//init
	//destory
	//
	//update
	//
}

Physics.prototype.init = function() {
	this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.overlappingPairCache = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    
    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
    this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

Physics.prototype.destroy = function() {
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

Physics.prototype.reset = function() {
    this.destroy();
    this.init();
}

Physics.prototype.addObject = function(obj) {
	this.objects.push(obj.physicsData.body);

	this.dynamicsWorld.addRigidBody(obj.physicsData.body);
}

Physics.prototype.createBlock = function(props) {
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

Physics.prototype.createSphere = function(props) {
}

Physics.prototype.createCustomShape = function(props) {
}

Physics.prototype.createJoint = function(props) {
}

Physics.prototype.setAllObjectProps = function(props) {
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

var _trans3 = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

Physics.prototype.getObjectProps = function(index) {
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

Physics.prototype.getAllObjectProps = function() {
	var props = [];
	var c = 0;
    var _this = this;

	this.objects.forEach(function(body) {
		props.push(_this.getObjectProps(c));
		c++;
	});

	return props;
}

Physics.prototype.removeAll = function(destroy) {
    var world = this.dynamicsWorld;
    this.objects.forEach(function (obj) {
        world.removeRigidBody(obj);
        if (destroy)
            Ammo.destroy(obj);
    });
    this.objects = [];
}

Physics.prototype.update = function(speed) {
	this.dynamicsWorld.stepSimulation(speed, 7);
}