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
}

Physics.prototype.addObject = function(obj) {
	this.objects.push(obj.physicsData.body);

	this.dynamicsWorld.addRigidBody(obj.physicsData.body);
}

Physics.prototype.update = function() {
	this.dynamicsWorld.stepSimulation(1, 10);
}