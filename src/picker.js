function inRange(x, min, max) {
	return x >= min && x <= max;
}

class Picker {
	constructor(renderer, physics, controllers, client) {
		this.enabled = false;

	    this.renderer = renderer;
	    this.physics = physics;
	    this.controllers = controllers;
		this.client = client;
		this.frame = 0;

	    this.floor = null;

		this.orbitControls = this.renderer.getOrbitControls();
		this.mouseDown = false;

		this.controllers.on("mousedown", (ct) => {
			console.log("md");
	        let renderer = this.renderer;

	        let intersects = renderer.raycastObjects(new THREE.Vector2(ct.x, ct.y));

	        if (intersects.length > 0) {
	            let obj = intersects[0].object;

	            if (!obj.userData.static) {
	                ct.selected = obj;

	                let p = intersects[0].point;

					ct.draggingPlane = new THREE.Plane();
	                ct.draggingPlane.setFromNormalAndCoplanarPoint(renderer.camera.getWorldDirection(ct.draggingPlane.normal), p);

	                let raycaster = renderer.raycaster;

	                let intersection = new THREE.Vector3();

	                if (raycaster.ray.intersectPlane(ct.draggingPlane, intersection)) {
						this.renderer.orbitControls.enableRotate = false;

						let body = ct.selected.userData.body;

						let pos = ct.selected.worldToLocal(p);
		                let i = this.physics.objects.indexOf(body);

			            console.log("CREATING");

		               	let event = {frame: this.frame, name: "CREATE", index: i, data: {x: pos.x, y: pos.y, z: pos.z}};
		                this.client.push(event);
	                }
	            }
	        }
		});

		this.controllers.on("mouseup", (ct) => {
			console.log("mu");
			if (ct.selected) {
				ct.selected = null;

				let handle = ct.handle;

				if (this.client) {
	        		let event = {frame: this.frame, name: "DESTROY"};
	            	this.client.push(event);
	            }

				ct.draggingPlane = new THREE.Plane();
				this.renderer.orbitControls.enableRotate = true;
			}
		});

		this.controllers.on("mousemove", (ct) => {
			//console.log("mo");
	        if (ct.selected) {
	            let raycaster = this.renderer.raycaster;
	            raycaster.setFromCamera(ct, this.renderer.camera);

	            let intersection = new THREE.Vector3();

	            if (raycaster.ray.intersectPlane(ct.draggingPlane, intersection)) {
	                let newInt = new THREE.Vector3();
	                newInt.copy(intersection);

	                let localPos;
	                let X;
		            let Y;
		            let Z;

	                if (this.floor) {
	                	localPos = this.floor.worldToLocal(newInt);
	                	let params = this.floor.geometry.parameters;
	                	X = params.width*0.5;
	                	Y = params.height*0.5;
	                	Z = params.depth*0.5;
	                }

	                if (localPos && inRange(localPos.x, -X, X) && inRange(localPos.y, -Y-100, Y) && inRange(localPos.z, -Z, Z)) {
	                    /*console.log("in range in x "+inRange(localPos.x, -X, X)+", "+localPos.x);
	                    console.log("in range in y "+inRange(localPos.y, -Y-10000, Y)+", "+localPos.y);
	                    console.log("in range in z "+inRange(localPos.z, -Z, Z)+", "+localPos.z);
	                    return;*/
	                } else {
						let event = {frame: this.frame, name: "MOVE", data: {x: intersection.x, y: intersection.y, z: intersection.z}};
		                this.client.push(event);
			            //ct.handle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
	                }
	            }
	        }
		});
	}

	setFloor(floor) {
		this.floor = floor.renderData.mesh;
	}

	removeFloor() {
		this.floor = null;
	}

	update(frame) {
		if (this.enabled) {
			this.frame = frame;
		}
	}
}
