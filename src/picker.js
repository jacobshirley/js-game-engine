function inRange(x, min, max) {
	return x >= min && x <= max;
}

class Picker {
	constructor(renderer, physics) {
		this.enabled = false;
		this.enableFloorDragging = true;
		this.justFinished = false;

		this._mouse = { x: 0, y: 0, down: false, held: false, up: false, moved: false };

	    $(window).mousedown((event) => {
	        event.preventDefault();

	        this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	        this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	        this._mouse.down = this._mouse.held = true;
	    });

	    $(window).mouseup((event) => {
	        event.preventDefault();

	        this._mouse.up = true;
	    });

	    $(window).mousemove((event) => {
	        event.preventDefault();

	        if (this._mouse.held) {
	            this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	            this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	            this._mouse.moved = true;
	        }
	    });

	    this.renderer = renderer;
	    this.physics = physics;

	    this.selected = null;

	    this.draggingPlane = new THREE.Plane();
	    this.draggingHandle = null;

	    this.floor = null;

	    this.networking = null;

	    this.updatesRecord = [];
	}

	setNetworking(networking) {
		this.networking = networking;
	}

	setFloor(floor) {
		this.floor = floor.renderData.mesh;
	}

	removeFloor() {
		this.floor = null;
	}

	update() {
		if (this.enabled) {
			if (this._mouse.up) {
		        this._mouse.up = false;
		        if (this.selected) {
		            this._mouse.held = false;
		            this.justFinished = true;
		            this.selected = null;

		            if (this.networking) {
		        		let event = {frame: this.networking.tick, name: "DESTROY"};
		            	this.networking.addUpdate(event);
		            }

		            this.draggingPlane = new THREE.Plane();

		            if (this.networking.isHost) {
			            this.physics.dynamicsWorld.removeConstraint(this.draggingHandle);
			            Ammo.destroy(this.draggingHandle);
			        }

		            let controls = this.renderer.getOrbitControls();
		            controls.enableRotate = true;
		        }
		    }
		    if (this._mouse.down) {
		        this._mouse.down = false;

		        let renderer = this.renderer;

		        let intersects = renderer.raycastObjects(new THREE.Vector2(this._mouse.x, this._mouse.y));

		        if (intersects.length > 0) {
		            let obj = intersects[0].object;
		            
		            if (!obj.userData.static) {
		                this.selected = obj;
		            
		                let body = this.selected.userData.body;

		                let p = intersects[0].point;

		                this.draggingPlane.setFromNormalAndCoplanarPoint(renderer.camera.getWorldDirection(this.draggingPlane.normal), p);

		                let raycaster = renderer.raycaster;
		                let controls = renderer.getOrbitControls();

		                let intersection = new THREE.Vector3();

		                if (raycaster.ray.intersectPlane(this.draggingPlane, intersection)) {
		                    controls.enableRotate = false;

		                    let pos = this.selected.worldToLocal(p);
		                    this.draggingHandle = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(pos.x, pos.y, pos.z));

		                    let i = 0;

			                let objs = this.physics.objects;
			                for (let c = 0; c < objs.length; c++) {
			                	if (body == objs[c]) {
			                		i = c;
			                		break;
			                	}
			                }

			                console.log("CREATING");

		                	let event = {frame: this.networking.tick, name: "CREATE", index: i, data: {x: pos.x, y: pos.y, z: pos.z}};
		                	if (this.networking) {
		                		this.networking.addUpdate(event);
		                	}

		                	if (this.networking.isHost) {
		                    	this.physics.dynamicsWorld.addConstraint(this.draggingHandle);
		                    }
		                    let setting = this.draggingHandle.get_m_setting();
		                    //setting.set_m_impulseClamp(120);
		                    //setting.set_m_tau(0.001);
		                }
		            }
		        }
		    }
		    if (this._mouse.held && this._mouse.moved) {
		        this._mouse.moved = false;
		        if (this.selected) {
		            let raycaster = this.renderer.raycaster;
		            raycaster.setFromCamera(this._mouse, this.renderer.camera);

		            let intersection = new THREE.Vector3();

		            if (raycaster.ray.intersectPlane(this.draggingPlane, intersection)) {
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
		                	let event = {frame: this.networking.tick, name: "MOVE", data: {x: intersection.x, y: intersection.y, z: intersection.z}};
		                	if (this.networking) {
		                		this.networking.addUpdate(event);
		                	}

		                	if (this.networking.isHost) {
		                    	this.draggingHandle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
		                    }
		                }
		            }
		        }
		    }//*/
		}
	}
}