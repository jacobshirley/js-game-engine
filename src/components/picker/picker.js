import PickerBase from "./picker-base.js";
import Ammo from "../ammo/ammo.js";

function inRange(x, min, max) {
	return x >= min && x <= max;
}

export default class Picker extends PickerBase {
	constructor(queue, renderer, physics, mouse) {
		super(queue, physics);

		this.enabled = false;

	    this.renderer = renderer;
	    this.mouse = mouse;
		this.queue = queue;

	    this.floor = null;

		this.orbitControls = this.renderer.getOrbitControls();
		this.mouseDown = false;

		this.mouse.on("mousedown", (ct) => {
			let callback = new Ammo.ClosestRayResultCallback();
			let world = this.physics.dynamicsWorld;

	        let renderer = this.renderer;

	        let intersects = renderer.raycastObjects(new THREE.Vector2(ct.x, ct.y));

	        if (intersects.length > 0) {
	            let obj = intersects[0].object;
				let i = renderer.meshes.indexOf(obj);
				let pObj = this.physics.objects[i];

	            if (!pObj.isStaticObject()) {
	                ct.userData.selected = obj;

	                let p = intersects[0].point;

					ct.userData.draggingPlane = new THREE.Plane();
	                ct.userData.draggingPlane.setFromNormalAndCoplanarPoint(renderer.camera.getWorldDirection(ct.userData.draggingPlane.normal), p);

	                let raycaster = renderer.raycaster;

	                let intersection = new THREE.Vector3();

	                if (raycaster.ray.intersectPlane(ct.userData.draggingPlane, intersection)) {
						this.renderer.orbitControls.enableRotate = false;

						let body = pObj;
						let pos = ct.userData.selected.worldToLocal(p);

		               	let event = {name: "PICKER_START_DRAG", index: i, data: {x: pos.x, y: pos.y, z: pos.z}};
		                this.queue.pushFramed(event, true);
	                }
	            }
	        }
		});

		this.mouse.on("mouseup", (ct) => {
			if (ct.userData.selected) {
				ct.userData.selected = null;

	        	let event = {name: "PICKER_STOP_DRAG"};
	            this.queue.pushFramed(event, true);

				ct.userData.draggingPlane = new THREE.Plane();
				this.renderer.orbitControls.enableRotate = true;
			}
		});

		this.mouse.on("mousemove", (ct) => {
	        if (ct.userData.selected) {
	            let raycaster = this.renderer.raycaster;
	            raycaster.setFromCamera(ct, this.renderer.camera);

	            let intersection = new THREE.Vector3();

	            if (raycaster.ray.intersectPlane(ct.userData.draggingPlane, intersection)) {
				//	console.log("mo");
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

	                if (false && localPos && inRange(localPos.x, -X, X) && inRange(localPos.y, -Y-100, Y) && inRange(localPos.z, -Z, Z)) {
	                    /*console.log("in range in x "+inRange(localPos.x, -X, X)+", "+localPos.x);
	                    console.log("in range in y "+inRange(localPos.y, -Y-10000, Y)+", "+localPos.y);
	                    console.log("in range in z "+inRange(localPos.z, -Z, Z)+", "+localPos.z);
	                    return;*/
	                } else {
						let event = {name: "PICKER_DRAG", data: {x: intersection.x, y: intersection.y, z: intersection.z}};
		                this.queue.pushFramed(event, true);
	                }
	            }
	        }
		});
	}

	setFloor(floor) {
		this.floor = floor.renderObj;
	}

	removeFloor() {
		this.floor = null;
	}

	update(frame) {

	}
}
