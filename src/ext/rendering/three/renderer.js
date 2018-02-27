import DOMRenderer from "../dom-renderer.js";

export default class ThreeRenderer extends DOMRenderer {
	constructor(domOwner) {
		super(domOwner);

		this.orbitControls = null;
		this.scale = 2;
		this.textureLoader = new THREE.TextureLoader();
	}

	init() {
		this.meshes = [];

		this.raycaster = new THREE.Raycaster();
		this.scene = new THREE.Scene();

	    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000 * this.scale);
	    this.camera.position.x = 3 * this.scale;
	    this.camera.position.y = 3 * this.scale;
	    this.camera.position.z = 3 * this.scale;

	    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	    this.renderer.shadowMap.enabled = true;
	    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	    this.domOwner.appendChild(this.renderer.domElement);
	}

	resize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
	}

	createCube(props) {
		let size = props.size||{width:0, height:0, length:0};
    	let position = props.position||{x: 0, y: 0, z: 0};
    	let rotation = props.rotation||{x: 0, y: 0, z: 0};
		let castShadow = props.castShadow||false;
		let receiveShadow = props.receiveShadow||false;
    	let mass = props.mass||0;
    	let color = props.color||0;
		let material = props.material||new THREE.MeshStandardMaterial({color});
		let geometry = new THREE.BoxGeometry(size.width * 2, size.height * 2, size.length * 2);
        let mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
        mesh.position.set(position.x, position.y, position.z);

		return mesh;
	}

	createSphere() {
		let size = props.radius||{radius: 0};
    	let position = props.position||{x: 0, y: 0, z: 0};
    	let rotation = props.rotation||{x: 0, y: 0, z: 0};
		let castShadow = props.castShadow||false;
		let receiveShadow = props.receiveShadow||false;
    	let color = props.color||0;
		let material = props.material||new THREE.MeshStandardMaterial({color: color});
    	let geometry = new THREE.SphereGeometry(size.radius, 32, 32);
        let mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
        mesh.position.set(position.x, position.y, position.z);

    	return mesh;
	}

	destroy() {

	}

	addObject(object) {
		if (object instanceof THREE.Light) {
			this.scene.add(object);
		} else {
			if (this.meshes.indexOf(object) == -1) {
				this.meshes.push(object);
				this.scene.add(object);
			}
		}
	}

	removeObject(object) {
		if (object instanceof THREE.Light) {
			this.scene.remove(object);
		} else {
			this.meshes.splice(this.meshes.indexOf(object), 1);
			this.scene.remove(object);
		}
	}

	raycastObjects(position) {
		this.raycaster.setFromCamera(position, this.camera);
	    return this.raycaster.intersectObjects(this.scene.children);
	}

	getCamera() {
		return this.camera;
	}

	setCamera(camera) {
		this.camera = camera;
	}

	getScene() {
		return scene;
	}

	setScene(scene) {
		this.scene = scene;
	}

	createOrbitControls() {
		this.orbitControls = new THREE.OrbitControls(this.camera);
	    this.orbitControls.enableDamping = false;
	    this.orbitControls.maxPolarAngle = Math.PI / 2;
	}

	getOrbitControls() {
		return this.orbitControls;
	}

	destroyOrbitControls() {
		this.orbitControls = null;
	}

	removeAll() {
		let scene = this.scene;
		this.meshes.forEach(function (child) {
			scene.remove(child);
		});
		this.meshes = [];
		//scene.children = [];
	}

	render() {
		if (this.orbitControls)
			this.orbitControls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
