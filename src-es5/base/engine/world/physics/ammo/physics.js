"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require("../../objects/block.js");

var _block2 = _interopRequireDefault(_block);

var _ammo = require("../../../../shims/ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _trans3 = new _ammo2.default.btTransform();

class Physics {
  constructor() {
    this.dynamicsWorld = null;
    this.objects = [];
  }

  init() {
    this.collisionConfiguration = new _ammo2.default.btDefaultCollisionConfiguration(); // every single |new| currently leaks...

    this.dispatcher = new _ammo2.default.btCollisionDispatcher(this.collisionConfiguration);
    this.overlappingPairCache = new _ammo2.default.btDbvtBroadphase();
    this.solver = new _ammo2.default.btSequentialImpulseConstraintSolver();
    this.dynamicsWorld = new _ammo2.default.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
    this.dynamicsWorld.setGravity(new _ammo2.default.btVector3(0, -10, 0));
  }

  destroy() {
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

  reset(keepOldObjects) {
    this.destroy();
    this.init();
  }

  addObject(obj) {
    if (obj instanceof _block2.default) {
      this.objects.push(obj.physicsData.body);
      this.dynamicsWorld.addRigidBody(obj.physicsData.body);
    } else if (obj instanceof _ammo2.default.btPoint2PointConstraint) {
      this.dynamicsWorld.addConstraint(obj);
    }
  }

  createBlock(props) {
    let size = props.size || {
      width: 0,
      height: 0,
      length: 0
    };
    let position = props.position || {
      x: 0,
      y: 0,
      z: 0
    };
    let rotation = props.rotation || {
      x: 0,
      y: 0,
      z: 0
    };
    let mass = props.mass || 0;
    let size2 = new _ammo2.default.btVector3(size.width, size.height, size.length);
    let sideShape = new _ammo2.default.btBoxShape(size2);
    sideShape.setMargin(0.05);
    let sideTransform = new _ammo2.default.btTransform();
    sideTransform.setIdentity();
    sideTransform.setOrigin(new _ammo2.default.btVector3(position.x, position.y, position.z));
    let quat = new _ammo2.default.btQuaternion();
    quat.setEulerZYX(rotation.z, rotation.y, rotation.x);
    sideTransform.setRotation(quat);
    let isDynamic = mass !== 0;
    let localInertia = new _ammo2.default.btVector3(0, 0, 0);
    if (isDynamic) sideShape.calculateLocalInertia(mass, localInertia);
    let myMotionState = new _ammo2.default.btDefaultMotionState(sideTransform);
    let rbInfo = new _ammo2.default.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
    let body = new _ammo2.default.btRigidBody(rbInfo);
    body.setDamping(0, 0.2);
    body.setActivationState(4);
    body.setFriction(0.8);
    return body;
  }

  createSphere(props) {}

  createCustomShape(props) {}

  createJoint(props) {
    let type = props.type || "point2point";
    let pos = props.position;
    let body1 = props.body1;
    let body2 = props.body2;

    if (type == "point2point") {
      return new _ammo2.default.btPoint2PointConstraint(body1, new _ammo2.default.btVector3(pos.x, pos.y, pos.z));
    }
  }

  removeObject(obj) {
    if (obj instanceof _block2.default) {
      this.objects.splice(this.objects.indexOf(obj.physicsData.body), 1);
      this.dynamicsWorld.removeRigidBody(obj.physicsData.body);
    } else if (obj instanceof _ammo2.default.btPoint2PointConstraint) {
      this.dynamicsWorld.removeConstraint(obj);
    }
  }

  setObjectProps(body, prop) {
    let aVel = prop.aVel;
    let lVel = prop.lVel;
    let pos = prop.pos;
    let rot = prop.rot;
    _trans3 = body.getWorldTransform(); //body.getMotionState().getWorldTransform(_trans3);

    _trans3.setOrigin(new _ammo2.default.btVector3(pos.x, pos.y, pos.z));

    let rows = rot;
    let matrix = new _ammo2.default.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z, rows[1].x, rows[1].y, rows[1].z, rows[2].x, rows[2].y, rows[2].z);

    _trans3.setBasis(matrix);

    body.setAngularVelocity(new _ammo2.default.btVector3(aVel.x, aVel.y, aVel.z));
    body.setLinearVelocity(new _ammo2.default.btVector3(lVel.x, lVel.y, lVel.z));
  }

  setAllObjectProps(props) {
    let objects = this.objects;

    for (let prop of props) {
      let body = objects[prop.index];
      this.setObjectProps(body, prop);
    }
  }

  getObjectProps(body) {
    let aVel = body.getAngularVelocity();
    let lVel = body.getLinearVelocity();
    _trans3 = body.getWorldTransform();

    let origin = _trans3.getOrigin();

    let rotation = _trans3.getRotation();

    let basis = _trans3.getBasis();

    let rows = [];

    for (let i = 0; i < 3; i++) {
      let row = basis.getRow(i);
      rows.push({
        x: row.x(),
        y: row.y(),
        z: row.z()
      });
    }

    let pos = {
      x: origin.x(),
      y: origin.y(),
      z: origin.z()
    };
    let rot = rows;
    let result = {
      pos: pos,
      rot: rot,
      aVel: {
        x: aVel.x(),
        y: aVel.y(),
        z: aVel.z()
      },
      lVel: {
        x: lVel.x(),
        y: lVel.y(),
        z: lVel.z()
      }
    };
    return result;
  }

  getAllObjectProps() {
    let props = [];
    let c = 0;

    for (let body of this.objects) {
      let o = this.getObjectProps(body);
      o.index = c++;
      props.push(o);
    }

    return props;
  }

  removeAll(destroy) {
    let world = this.dynamicsWorld;

    for (let obj of this.objects) {
      world.removeRigidBody(obj);
      if (destroy) _ammo2.default.destroy(obj);
    }

    this.objects = [];
  }

  update(speed) {
    this.dynamicsWorld.stepSimulation(speed, 7);
  }

}

exports.default = Physics;