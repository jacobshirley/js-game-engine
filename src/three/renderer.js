export default class Renderer {
	constructor() {
		this.orbitControls = null;
		this.scale = 1;
	}

	init() {
		this.meshes = [];

		this.raycaster = new THREE.Raycaster();
		this.scene = new THREE.Scene();

	    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000*this.scale);
	    this.camera.position.x = 3*this.scale;
	    this.camera.position.y = 3*this.scale;
	    this.camera.position.z = 3*this.scale;

	    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	    this.renderer.setSize(window.innerWidth, window.innerHeight);
	    this.renderer.shadowMap.enabled = true;
	    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	    document.body.appendChild(this.renderer.domElement);
	}

	destroy() {

	}

	addObject(object) {
		if (object instanceof THREE.Light) {
			this.scene.add(object);
		} else {
			this.meshes.push(object.renderData.mesh);
			this.scene.add(object.renderData.mesh);
		}
	}

	removeObject(object) {

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
