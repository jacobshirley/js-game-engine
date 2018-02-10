"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gameTimer = require("./timing/game-timer.js");

var _gameTimer2 = _interopRequireDefault(_gameTimer);

var _picker = require("./picker.js");

var _picker2 = _interopRequireDefault(_picker);

var _ammo = require("../shims/ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

var _objectSynchronizer = require("./sync/object-synchronizer.js");

var _objectSynchronizer2 = _interopRequireDefault(_objectSynchronizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _trans = new _ammo2.default.btTransform(); // taking this out of the loop below us reduces the leaking

var DEFAULT_UPDATE_RATE = 1000 / 60;

var World = function () {
    function World(game, renderer, physics) {
        _classCallCheck(this, World);

        this.objects = [];

        this.renderTimer = game.renderTimer;
        this.queue = game.queue;
        this.controllers = game.controllers;
        this.renderer = renderer;
        this.physics = physics;

        this.synchronizer = new _objectSynchronizer2.default();
    }

    _createClass(World, [{
        key: "render",
        value: function render() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    var body = obj.physicsData.body;
                    var mesh = obj.renderData.mesh;
                    var mS = body.getMotionState();
                    if (mS) {
                        mS.getWorldTransform(_trans);

                        var origin = _trans.getOrigin();
                        var rotation = _trans.getRotation();

                        mesh.position.set(origin.x(), origin.y(), origin.z());
                        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.renderer.render();
        }
    }, {
        key: "logic",
        value: function logic(frame) {
            this.physics.update(this.renderTimer.updateInterval / 1000.0);
        }
    }, {
        key: "reset",
        value: function reset(state) {
            var newObjects = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var object = _step2.value;

                    newObjects.push(object.copy());
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            this.removeAll(true);
            this.physics.reset();

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = newObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _object = _step3.value;

                    this.addObject(_object);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            if (state) this.physics.setAllObjectProps(state);
        }
    }, {
        key: "addObject",
        value: function addObject(object) {
            object.init(this.physics);
            object.initRenderer(this.renderer);

            this.objects.push(object);

            this.renderer.addObject(object);
            this.physics.addObject(object);
        }
    }, {
        key: "removeAll",
        value: function removeAll(destroy) {
            this.physics.removeAll(destroy);
            this.renderer.removeAll();

            this.objects = [];
        }
    }, {
        key: "getDebugString",
        value: function getDebugString() {
            return "<br />Net updates: " + this.queue.processedUpdates;
        }
    }]);

    return World;
}();

exports.default = World;