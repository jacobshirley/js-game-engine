"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _domRenderer = require("../dom-renderer.js");

var _domRenderer2 = _interopRequireDefault(_domRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ThreeRenderer = function (_DOMRenderer) {
	_inherits(ThreeRenderer, _DOMRenderer);

	function ThreeRenderer(domOwner) {
		_classCallCheck(this, ThreeRenderer);

		var _this = _possibleConstructorReturn(this, (ThreeRenderer.__proto__ || Object.getPrototypeOf(ThreeRenderer)).call(this, domOwner));

		_this.orbitControls = null;
		_this.scale = 1;
		return _this;
	}

	_createClass(ThreeRenderer, [{
		key: "init",
		value: function init() {
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
	}, {
		key: "createBlock",
		value: function createBlock(props) {
			var size = props.size || { width: 0, height: 0, length: 0 };
			var position = props.position || { x: 0, y: 0, z: 0 };
			var rotation = props.rotation || { x: 0, y: 0, z: 0 };
			var mass = props.mass || 0;
			var color = props.color || 0;

			var geometry = new THREE.BoxGeometry(size.width * 2, size.height * 2, size.length * 2);
			var material = new THREE.MeshPhongMaterial({ color: color });

			var mesh = new THREE.Mesh(geometry, material);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.set(position.x, position.y, position.z);

			return mesh;
		}
	}, {
		key: "destroy",
		value: function destroy() {}
	}, {
		key: "addObject",
		value: function addObject(object) {
			if (object instanceof THREE.Light) {
				this.scene.add(object);
			} else {
				this.meshes.push(object.renderData.mesh);
				this.scene.add(object.renderData.mesh);
			}
		}
	}, {
		key: "removeObject",
		value: function removeObject(object) {}
	}, {
		key: "raycastObjects",
		value: function raycastObjects(position) {
			this.raycaster.setFromCamera(position, this.camera);
			return this.raycaster.intersectObjects(this.scene.children);
		}
	}, {
		key: "getCamera",
		value: function getCamera() {
			return this.camera;
		}
	}, {
		key: "setCamera",
		value: function setCamera(camera) {
			this.camera = camera;
		}
	}, {
		key: "createOrbitControls",
		value: function createOrbitControls() {
			this.orbitControls = new THREE.OrbitControls(this.camera);
			this.orbitControls.enableDamping = false;
			this.orbitControls.maxPolarAngle = Math.PI / 2;
		}
	}, {
		key: "getOrbitControls",
		value: function getOrbitControls() {
			return this.orbitControls;
		}
	}, {
		key: "destroyOrbitControls",
		value: function destroyOrbitControls() {
			this.orbitControls = null;
		}
	}, {
		key: "removeAll",
		value: function removeAll() {
			var scene = this.scene;
			this.meshes.forEach(function (child) {
				scene.remove(child);
			});
			this.meshes = [];
			//scene.children = [];
		}
	}, {
		key: "render",
		value: function render() {
			if (this.orbitControls) this.orbitControls.update();

			this.renderer.render(this.scene, this.camera);
		}
	}]);

	return ThreeRenderer;
}(_domRenderer2.default);

exports.default = ThreeRenderer;