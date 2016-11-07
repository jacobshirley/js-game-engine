function Environment() {
	this.renderer = null;
	this.physics = null;
	//add object
	//remove object
	//
}

function Object {
	this.renderData = {}; //rendering related stuff in here
	this.physicsData = {}; //physics related stuff in here

	this.x = function () {

	}

	this.y = function() {

	}

	this.rotation = function() {

	}
}

function Block { //extends object

}

function Renderer() {
	//add object
	//remove object
	//
	//raycastObjects
	//
	//render
	//
	//getFPS
}

function Physics() {
	this.dynamicsWorld = null;
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