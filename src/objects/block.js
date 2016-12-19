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
    }

    init(physics) {
        let body = physics.createBlock(this.props);

        this.physicsData = {
            body: body
        };

        let mesh = this.renderData.mesh;

        mesh.userData.body = body;
        mesh.userData.static = this.props.mass == 0;
    }

    copy() {
        return new Block(this.props);
    }
}