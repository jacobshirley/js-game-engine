"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _physics = require("./base/engine/physics/ammo/physics.js");

var _physics2 = _interopRequireDefault(_physics);

var _block = require("./base/engine/objects/block.js");

var _block2 = _interopRequireDefault(_block);

var _pickingPhysicsUpdater = require("./updaters/picking-physics-updater.js");

var _pickingPhysicsUpdater2 = _interopRequireDefault(_pickingPhysicsUpdater);

var _worldUpdater = require("./updaters/world-updater.js");

var _worldUpdater2 = _interopRequireDefault(_worldUpdater);

var _objectSynchronizer = require("./base/engine/sync/object-synchronizer.js");

var _objectSynchronizer2 = _interopRequireDefault(_objectSynchronizer);

var _lockstepGame = require("./base/game/lockstep/lockstep-game.js");

var _lockstepGame2 = _interopRequireDefault(_lockstepGame);

var _world = require("./base/engine/world.js");

var _world2 = _interopRequireDefault(_world);

var _picker = require("./base/engine/picker.js");

var _picker2 = _interopRequireDefault(_picker);

var _mouse = require("./base/controller/mouse.js");

var _mouse2 = _interopRequireDefault(_mouse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BRICKS = 10;

function setDebugText(text) {
    $("#debug").html(text);
}

var Dominos = function (_LockstepGame) {
    _inherits(Dominos, _LockstepGame);

    function Dominos(config) {
        _classCallCheck(this, Dominos);

        var _this = _possibleConstructorReturn(this, (Dominos.__proto__ || Object.getPrototypeOf(Dominos)).call(this, config));

        _this.renderer = config.renderer;
        return _this;
    }

    _createClass(Dominos, [{
        key: "initRenderer",
        value: function initRenderer() {
            //create the lighting

            var light = new THREE.DirectionalLight(0xdfebff, 1.75);
            light.position.set(10, 30, 10);
            light.position.multiplyScalar(1.3);

            light.castShadow = false;

            light.shadow.mapSize.width = 512 * 4;
            light.shadow.mapSize.height = 512 * 4;

            var d = 15;

            light.shadow.camera.left = -d;
            light.shadow.camera.right = d;
            light.shadow.camera.top = d;
            light.shadow.camera.bottom = -d;

            light.shadow.camera.far = 100;

            this.renderer.createOrbitControls();
            this.renderer.addObject(light);
            this.renderer.addObject(new THREE.AmbientLight(0x404040));
        }
    }, {
        key: "createObjects",
        value: function createObjects() {
            var props2 = { size: { width: 10, height: 1, length: 10 },
                position: { x: 0, y: -1, z: 0 },
                color: 0x00FFFF,
                mass: 0 };

            var floor = new _block2.default(props2);
            this.world.addObject(floor);

            if (!this.config.headless) this.picker.setFloor(floor);

            var w = 1 / 1.5;
            for (var i = 0; i < 1 * BRICKS; i++) {
                var mod = Math.floor(i / 3);
                var height = mod * 0.30;

                var props = { size: { width: 1 / 3, height: 1, length: 0.15 },
                    color: 0xFFFF00, mass: 1 };

                if (mod % 2 == 1) {
                    props.position = { x: -w + i % 3 * w, y: 0.15 + height, z: w };
                    props.rotation = { x: Math.PI / 2, y: 0, z: 0 };
                } else {
                    props.position = { x: 0, y: 0.15 + height, z: i % 3 * w };
                    props.rotation = { x: Math.PI / 2, y: Math.PI / 2, z: 0 };
                }

                var b = new _block2.default(props);
                this.world.addObject(b);
            }
        }
    }, {
        key: "init",
        value: function init() {
            if (!this.config.headless) {
                this.renderer.init();
                this.initRenderer();
            }

            this.physics = new _physics2.default();
            this.physics.init();

            this.world = new _world2.default(this, this.renderer, this.physics);

            if (!this.config.headless) {
                var mouse = new _mouse2.default(0);
                this.controllers.add(mouse);
                this.picker = new _picker2.default(this.renderer, this.physics, mouse, this.queue);
            }

            var physicsUpdater = new _pickingPhysicsUpdater2.default(this.queue, this.physics);
            this.queue.addProcessor(new _worldUpdater2.default(this.queue, physicsUpdater, this.world));

            this.createObjects();
        }
    }, {
        key: "logic",
        value: function logic(frame) {
            if (!this.config.headless) this.picker.update(frame);

            this.world.logic(frame);
        }
    }, {
        key: "render",
        value: function render() {
            this.world.render();

            setDebugText(this.getDebugString());
        }
    }]);

    return Dominos;
}(_lockstepGame2.default);

exports.default = Dominos;