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

class Block {
    constructor(props) {
        this.props = props;

    	//properties
    	
    	let size = props.size||{width:0, height:0, length:0};
    	let position = props.position||{x: 0, y: 0, z: 0};
    	let rotation = props.rotation||{x: 0, y: 0, z: 0};
    	let mass = props.mass||0;
    	let color = props.color||0;

    	//3d rendering
    	
    	let geometry = new THREE.BoxGeometry(size.width * 2, size.height * 2, size.length * 2);
        let material = new THREE.MeshPhongMaterial({color: color});

        let mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);

    	this.renderData = {
    		mesh: mesh
    	};

    	//physics

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

        body.setDamping(0, 0.5);
        body.setActivationState(4);
        body.setFriction(0.5);

        this.physicsData = {
        	body: body
        };

        mesh.userData.body = body;
        mesh.userData.static = mass == 0;
    }

    copy() {
        return new Block(this.props);
    }
}