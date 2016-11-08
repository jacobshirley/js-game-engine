function Ball(props) {

	//properties
	
	var size = props.size||{radius: 0};
	var position = props.position||{x: 0, y: 0, z: 0};
	var rotation = props.rotation||{x: 0, y: 0, z: 0};
	var mass = props.mass||0;
	var color = props.color||0;

	//3d rendering
	
	var geometry = new THREE.SphereGeometry(size.radius, 32, 32);
    var material = new THREE.MeshPhongMaterial({color: color});

    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(position.x, position.y, position.z);

	this.renderData = {
		mesh: mesh
	};

	//physics

    var sideShape = new Ammo.btSphereShape(size.radius);
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

    //body.setDamping(0, 0.2);
    body.setActivationState(4);
    //body.setFriction(0.6);

    this.physicsData = {
    	body: body
    };

    mesh.userData.body = body;
    mesh.userData.static = mass == 0;
}