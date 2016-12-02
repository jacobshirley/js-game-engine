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

	this.objects.forEach(function(body) {
        var aVel = body.getAngularVelocity();
        var lVel = body.getLinearVelocity();

        _trans3 = body.getWorldTransform();
        //body.getMotionState().getWorldTransform(_trans3);  

        var origin = _trans3.getOrigin();
        var rotation = _trans3.getRotation();

        var basis = _trans3.getBasis();
        var rows = [];
        for (var i = 0; i < 3; i++) {
            var row = basis.getRow(i);
            rows.push({x: row.x(), y: row.y(), z: row.z()});
        }

        /*var matrix = new Ammo.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z,
                                      rows[1].x, rows[1].y, rows[1].z,
                                      rows[2].x, rows[2].y, rows[2].z);*/

        var pos = {x: origin.x(), y: origin.y(), z: origin.z()};
        var rot = rows;

		props.push({index: c, 
                     pos: pos,
                     rot: rot,
                     aVel: {x: aVel.x(), y: aVel.y(), z: aVel.z()}, 
                     lVel: {x: lVel.x(), y: lVel.y(), z: lVel.z()}
                   });
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