"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _block = require("../../objects/block.js");

var _block2 = _interopRequireDefault(_block);

var _ammo = require("../../../shims/ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _trans3 = new _ammo2.default.btTransform();

var Physics = function () {
    function Physics() {
        _classCallCheck(this, Physics);

        this.dynamicsWorld = null;

        this.objects = [];
    }

    _createClass(Physics, [{
        key: "init",
        value: function init() {
            this.collisionConfiguration = new _ammo2.default.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
            this.dispatcher = new _ammo2.default.btCollisionDispatcher(this.collisionConfiguration);
            this.overlappingPairCache = new _ammo2.default.btDbvtBroadphase();
            this.solver = new _ammo2.default.btSequentialImpulseConstraintSolver();

            this.dynamicsWorld = new _ammo2.default.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
            this.dynamicsWorld.setGravity(new _ammo2.default.btVector3(0, -10, 0));
        }
    }, {
        key: "destroy",
        value: function destroy() {
            _ammo2.default.destroy(this.collisionConfiguration);
            _ammo2.default.destroy(this.dispatcher);
            _ammo2.default.destroy(this.overlappingPairCache);
            _ammo2.default.destroy(this.solver);
            _ammo2.default.destroy(this.dynamicsWorld);

            this.objects.forEach(function (obj) {
                _ammo2.default.destroy(obj);
            });

            this.objects = [];
        }
    }, {
        key: "reset",
        value: function reset(keepOldObjects) {
            this.destroy();
            this.init();
        }
    }, {
        key: "addObject",
        value: function addObject(obj) {
            if (obj instanceof _block2.default) {
                this.objects.push(obj.physicsData.body);

                this.dynamicsWorld.addRigidBody(obj.physicsData.body);
            } else if (obj instanceof _ammo2.default.btPoint2PointConstraint) {
                this.dynamicsWorld.addConstraint(obj);
            }
        }
    }, {
        key: "createBlock",
        value: function createBlock(props) {
            var size = props.size || { width: 0, height: 0, length: 0 };
            var position = props.position || { x: 0, y: 0, z: 0 };
            var rotation = props.rotation || { x: 0, y: 0, z: 0 };
            var mass = props.mass || 0;

            var size2 = new _ammo2.default.btVector3(size.width, size.height, size.length);
            var sideShape = new _ammo2.default.btBoxShape(size2);
            sideShape.setMargin(0.05);

            var sideTransform = new _ammo2.default.btTransform();
            sideTransform.setIdentity();
            sideTransform.setOrigin(new _ammo2.default.btVector3(position.x, position.y, position.z));

            var quat = new _ammo2.default.btQuaternion();
            quat.setEulerZYX(rotation.z, rotation.y, rotation.x);
            sideTransform.setRotation(quat);

            var isDynamic = mass !== 0;
            var localInertia = new _ammo2.default.btVector3(0, 0, 0);

            if (isDynamic) sideShape.calculateLocalInertia(mass, localInertia);

            var myMotionState = new _ammo2.default.btDefaultMotionState(sideTransform);
            var rbInfo = new _ammo2.default.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
            var body = new _ammo2.default.btRigidBody(rbInfo);

            body.setDamping(0, 0.2);
            body.setActivationState(4);
            body.setFriction(0.8);

            return body;
        }
    }, {
        key: "createSphere",
        value: function createSphere(props) {}
    }, {
        key: "createCustomShape",
        value: function createCustomShape(props) {}
    }, {
        key: "createJoint",
        value: function createJoint(props) {
            var type = props.type || "point2point";
            var pos = props.position;
            var body1 = props.body1;
            var body2 = props.body2;

            if (type == "point2point") {
                return new _ammo2.default.btPoint2PointConstraint(body1, new _ammo2.default.btVector3(pos.x, pos.y, pos.z));
            }
        }
    }, {
        key: "removeObject",
        value: function removeObject(obj) {
            if (obj instanceof _block2.default) {
                this.objects.splice(this.objects.indexOf(obj.physicsData.body), 1);

                this.dynamicsWorld.removeRigidBody(obj.physicsData.body);
            } else if (obj instanceof _ammo2.default.btPoint2PointConstraint) {
                this.dynamicsWorld.removeConstraint(obj);
            }
        }
    }, {
        key: "setObjectProps",
        value: function setObjectProps(body, prop) {
            var aVel = prop.aVel;
            var lVel = prop.lVel;

            var pos = prop.pos;
            var rot = prop.rot;

            _trans3 = body.getWorldTransform();
            //body.getMotionState().getWorldTransform(_trans3);

            _trans3.setOrigin(new _ammo2.default.btVector3(pos.x, pos.y, pos.z));
            var rows = rot;
            var matrix = new _ammo2.default.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z, rows[1].x, rows[1].y, rows[1].z, rows[2].x, rows[2].y, rows[2].z);

            _trans3.setBasis(matrix);

            body.setAngularVelocity(new _ammo2.default.btVector3(aVel.x, aVel.y, aVel.z));
            body.setLinearVelocity(new _ammo2.default.btVector3(lVel.x, lVel.y, lVel.z));
        }
    }, {
        key: "setAllObjectProps",
        value: function setAllObjectProps(props) {
            var objects = this.objects;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var prop = _step.value;

                    var body = objects[prop.index];
                    this.setObjectProps(body, prop);
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
        }
    }, {
        key: "getObjectProps",
        value: function getObjectProps(body) {
            var aVel = body.getAngularVelocity();
            var lVel = body.getLinearVelocity();

            _trans3 = body.getWorldTransform();

            var origin = _trans3.getOrigin();
            var rotation = _trans3.getRotation();

            var basis = _trans3.getBasis();
            var rows = [];
            for (var i = 0; i < 3; i++) {
                var row = basis.getRow(i);
                rows.push({ x: row.x(), y: row.y(), z: row.z() });
            }

            var pos = { x: origin.x(), y: origin.y(), z: origin.z() };
            var rot = rows;

            var result = { pos: pos,
                rot: rot,
                aVel: { x: aVel.x(), y: aVel.y(), z: aVel.z() },
                lVel: { x: lVel.x(), y: lVel.y(), z: lVel.z() }
            };

            return result;
        }
    }, {
        key: "getAllObjectProps",
        value: function getAllObjectProps() {
            var props = [];
            var c = 0;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var body = _step2.value;

                    var o = this.getObjectProps(body);
                    o.index = c++;
                    props.push(o);
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

            return props;
        }
    }, {
        key: "removeAll",
        value: function removeAll(destroy) {
            var world = this.dynamicsWorld;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var obj = _step3.value;

                    world.removeRigidBody(obj);
                    if (destroy) _ammo2.default.destroy(obj);
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

            this.objects = [];
        }
    }, {
        key: "update",
        value: function update(speed) {
            this.dynamicsWorld.stepSimulation(speed, 7);
        }
    }]);

    return Physics;
}();

exports.default = Physics;