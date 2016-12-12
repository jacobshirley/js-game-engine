/*function Object() {
	this.renderData = {}; //rendering related stuff in here
	this.physicsData = {}; //physics related stuff in here
    this.networkData = {};

	this.x = function () {

	}

	this.y = function() {

	}

	this.rotation = function() {

	}
}*/

function Block(props) {
    this.props = props;

	//properties
	
	var size = props.size||{width:0, height:0, length:0};
	var position = props.position||{x: 0, y: 0, z: 0};
	var rotation = props.rotation||{x: 0, y: 0, z: 0};
	var mass = props.mass||0;
	var color = props.color||0;

	//3d rendering
	
	var geometry = new THREE.BoxGeometry(size.width * 2, size.height * 2, size.length * 2);
    var material = new THREE.MeshPhongMaterial({color: color});

    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(position.x, position.y, position.z);

	this.renderData = {
		mesh: mesh
	};

	//physics

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

    body.setDamping(0, 0.5);
    body.setActivationState(4);
    body.setFriction(0.5);

    this.physicsData = {
    	body: body
    };

    mesh.userData.body = body;
    mesh.userData.static = mass == 0;
}

Block.prototype.copy = function() {
    return new Block(this.props);
}