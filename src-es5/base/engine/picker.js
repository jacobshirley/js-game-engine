"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function inRange(x, min, max) {
	return x >= min && x <= max;
}

var Picker = function () {
	function Picker(renderer, physics, mouse, queue) {
		var _this = this;

		_classCallCheck(this, Picker);

		this.enabled = false;

		this.renderer = renderer;
		this.physics = physics;
		this.mouse = mouse;
		this.queue = queue;
		this.frame = 0;

		this.floor = null;

		this.orbitControls = this.renderer.getOrbitControls();
		this.mouseDown = false;

		this.mouse.on("mousedown", function (ct) {
			var renderer = _this.renderer;

			var intersects = renderer.raycastObjects(new THREE.Vector2(ct.x, ct.y));

			if (intersects.length > 0) {
				var obj = intersects[0].object;

				if (!obj.userData.static) {
					ct.userData.selected = obj;

					var p = intersects[0].point;

					ct.userData.draggingPlane = new THREE.Plane();
					ct.userData.draggingPlane.setFromNormalAndCoplanarPoint(renderer.camera.getWorldDirection(ct.userData.draggingPlane.normal), p);

					var raycaster = renderer.raycaster;

					var intersection = new THREE.Vector3();

					if (raycaster.ray.intersectPlane(ct.userData.draggingPlane, intersection)) {
						console.log("lel");
						_this.renderer.orbitControls.enableRotate = false;

						var body = ct.userData.selected.userData.body;

						var pos = ct.userData.selected.worldToLocal(p);
						var i = _this.physics.objects.indexOf(body);

						var event = { name: "CREATE", index: i, data: { x: pos.x, y: pos.y, z: pos.z } };
						_this.queue.pushFramed(event);
					}
				}
			}
		});

		this.mouse.on("mouseup", function (ct) {
			if (ct.userData.selected) {
				ct.userData.selected = null;

				var event = { name: "DESTROY" };
				_this.queue.pushFramed(event);

				ct.userData.draggingPlane = new THREE.Plane();
				_this.renderer.orbitControls.enableRotate = true;
			}
		});

		this.mouse.on("mousemove", function (ct) {
			//console.log("mo");
			if (ct.userData.selected) {
				var raycaster = _this.renderer.raycaster;
				raycaster.setFromCamera(ct, _this.renderer.camera);

				var intersection = new THREE.Vector3();

				if (raycaster.ray.intersectPlane(ct.userData.draggingPlane, intersection)) {
					var newInt = new THREE.Vector3();
					newInt.copy(intersection);

					var localPos = void 0;
					var X = void 0;
					var Y = void 0;
					var Z = void 0;

					if (_this.floor) {
						localPos = _this.floor.worldToLocal(newInt);
						var params = _this.floor.geometry.parameters;
						X = params.width * 0.5;
						Y = params.height * 0.5;
						Z = params.depth * 0.5;
					}

					if (localPos && inRange(localPos.x, -X, X) && inRange(localPos.y, -Y - 100, Y) && inRange(localPos.z, -Z, Z)) {
						/*console.log("in range in x "+inRange(localPos.x, -X, X)+", "+localPos.x);
      console.log("in range in y "+inRange(localPos.y, -Y-10000, Y)+", "+localPos.y);
      console.log("in range in z "+inRange(localPos.z, -Z, Z)+", "+localPos.z);
      return;*/
					} else {
						var event = { name: "MOVE", data: { x: intersection.x, y: intersection.y, z: intersection.z } };
						_this.queue.pushFramed(event);
					}
				}
			}
		});
	}

	_createClass(Picker, [{
		key: "setFloor",
		value: function setFloor(floor) {
			this.floor = floor.renderData.mesh;
		}
	}, {
		key: "removeFloor",
		value: function removeFloor() {
			this.floor = null;
		}
	}, {
		key: "update",
		value: function update(frame) {}
	}]);

	return Picker;
}();

exports.default = Picker;