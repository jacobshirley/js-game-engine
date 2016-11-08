function Picker(renderer, physics) {
	this.enabled = false;
	this.enableFloorDragging = true;

	this._mouse = { x: 0, y: 0, down: false, held: false, up: false, moved: false };

	var _this = this;
    $(window).mousedown(function(event) {
        event.preventDefault();

        _this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        _this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        _this._mouse.down = _this._mouse.held = true;
    });

    $(window).mouseup(function(event) {
        event.preventDefault();

        _this._mouse.up = true;
    });

    $(window).mousemove(function(event) {
        event.preventDefault();

        if (_this._mouse.held) {
            _this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            _this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            _this._mouse.moved = true;
        }
    });

    this.renderer = renderer;
    this.physics = physics;

    this.selected = null;

    this.draggingPlane = new THREE.Plane();
    this.draggingHandle = null;
}

Picker.prototype.update = function() {
	if (this.enabled) {
		if (this._mouse.up) {
	        this._mouse.up = false;
	        if (this.selected) {
	            this._mouse.held = false;
	            this.selected = null;

	            this.draggingPlane = new THREE.Plane();
	            this.physics.dynamicsWorld.removeConstraint(this.draggingHandle);
	            Ammo.destroy(this.draggingHandle);

	            var controls = this.renderer.getOrbitControls();
	            controls.noRotate = false;
	        }
	    }
	    if (this._mouse.down) {
	        this._mouse.down = false;

	        var renderer = this.renderer;

	        var intersects = renderer.raycastObjects(new THREE.Vector2(this._mouse.x, this._mouse.y));

	        if (intersects.length > 0) {
	            var obj = intersects[0].object;
	            
	            if (!obj.userData.static) {
	                this.selected = obj;
	            
	                var body = this.selected.userData.body;

	                var p = intersects[0].point;

	                this.draggingPlane.setFromNormalAndCoplanarPoint(renderer.camera.getWorldDirection(this.draggingPlane.normal), p);

	                var raycaster = renderer.raycaster;
	                var controls = renderer.getOrbitControls();

	                var intersection = new THREE.Vector3();

	                if (raycaster.ray.intersectPlane(this.draggingPlane, intersection)) {
	                    controls.noRotate = true;

	                    var pos = this.selected.worldToLocal(p);
	                    this.draggingHandle = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(pos.x, pos.y, pos.z));

	                    this.physics.dynamicsWorld.addConstraint(this.draggingHandle);

	                    var setting = this.draggingHandle.get_m_setting();
	                    //setting.set_m_impulseClamp(120);
	                    setting.set_m_tau(0.001);
	                }
	            }
	        }
	    }
	    if (this._mouse.held && this._mouse.moved) {
	        this._mouse.moved = false;
	        if (this.selected) {
	            var raycaster = this.renderer.raycaster;
	            raycaster.setFromCamera(this._mouse, this.renderer.camera);

	            var intersection = new THREE.Vector3();

	            if (raycaster.ray.intersectPlane(this.draggingPlane, intersection)) {
	                /*var newInt = new THREE.Vector3();
	                newInt.copy(intersection);
	                if (enableFloorDragging) {

	                }
	                /*var localPos = floorMesh.worldToLocal(newInt);

	                var X = 5000;
	                var Y = 500;
	                var Z = 5000;

	                if (inRange(localPos.x, -X, X) && inRange(localPos.y, -Y-10000, Y) && inRange(localPos.z, -Z, Z)) {
	                    /*console.log("in range in x "+inRange(localPos.x, -X, X)+", "+localPos.x);
	                    console.log("in range in y "+inRange(localPos.y, -Y-10000, Y)+", "+localPos.y);
	                    console.log("in range in z "+inRange(localPos.z, -Z, Z)+", "+localPos.z);
	                    return;*/
	                //} else {
	                    this.draggingHandle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
	                //}
	            }
	        }
	    }//*/
	}
}