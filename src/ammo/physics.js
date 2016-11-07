function Physics() {
	this.dynamicsWorld = null;

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
}

Physics.prototype.init = function() {
	var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}