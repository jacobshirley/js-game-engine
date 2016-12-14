function Renderer() {
	this.orbitControls = null;
	this.scale = 1;
	//add object
	//remove object
	//
	//raycastObjects
	//
	//render
	//
	//getFPS
	//
}

Renderer.prototype.init = function() {
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

Renderer.prototype.destroy = function() {

}

Renderer.prototype.addObject = function(object) {
	if (object instanceof THREE.Light) {
		this.scene.add(object);
	} else {
		this.meshes.push(object.renderData.mesh);
		this.scene.add(object.renderData.mesh);
	}
}

Renderer.prototype.removeObject = function(object) {

}

Renderer.prototype.raycastObjects = function(position) {
	this.raycaster.setFromCamera(position, this.camera);
    return this.raycaster.intersectObjects(this.scene.children);
}

Renderer.prototype.getCamera = function() {
	return this.camera;
}

Renderer.prototype.setCamera = function(camera) {
	this.camera = camera;
}

Renderer.prototype.createOrbitControls = function() {
	this.orbitControls = new THREE.OrbitControls(this.camera);
    this.orbitControls.enableDamping = false;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
}

Renderer.prototype.getOrbitControls = function() {
	return this.orbitControls;
}

Renderer.prototype.destroyOrbitControls = function() {
	this.orbitControls = null;
}

Renderer.prototype.removeAll = function() {
	var scene = this.scene;
	this.meshes.forEach(function (child) {
		scene.remove(child);
	});
	//scene.children = [];
}

Renderer.prototype.render = function() {
	if (this.orbitControls)
		this.orbitControls.update();

	this.renderer.render(this.scene, this.camera);
}