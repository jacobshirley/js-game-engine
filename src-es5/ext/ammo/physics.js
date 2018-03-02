"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ammo = require("./ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _trans3 = new _ammo2.default.btTransform();

class Physics {
  constructor() {
    this.dynamicsWorld = null;
    this.objects = [];
    this.constraints = [];
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

  setGravity(grav) {
    this.dynamicsWorld.setGravity(new _ammo2.default.btVector3(0, grav, 0));
  }

  getBodyID(body) {
    return this.objects.indexOf(body);
  }

  reset() {
    this.removeAll(true);
    this.destroy();
    this.init();
  }

  createBlock(def) {
    return Physics.createBlock(def);
  }

  static createBlock(def) {
    let size = def.size || {
      width: 0,
      height: 0,
      length: 0
    };
    let position = def.position || {
      x: 0,
      y: 0,
      z: 0
    };
    let rotation = def.rotation || {
      x: 0,
      y: 0,
      z: 0
    };
    let margin = def.margin || 0.04;
    let mass = def.mass || 0;
    let damping = def.damping || 0.9;
    let friction = def.friction || 0.5;
    let size2 = new _ammo2.default.btVector3(size.width, size.height, size.length);
    let sideShape = new _ammo2.default.btBoxShape(size2);
    sideShape.setMargin(margin);
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
    body.setDamping(0, damping);
    body.setFriction(friction);
    body.setActivationState(4);
    return body;
  }

  createSphere(def) {
    return Physics.createSphere(def);
  }

  static createSphere(def) {
    let size = def.size || {
      radius: 1
    };
    let position = def.position || {
      x: 0,
      y: 0,
      z: 0
    };
    let rotation = def.rotation || {
      x: 0,
      y: 0,
      z: 0
    };
    let margin = def.margin || 0.04;
    let mass = def.mass || 0;
    let damping = def.damping || 0.9;
    let friction = def.friction || 0.5;
    let sideShape = new _ammo2.default.btSphereShape(size.radius);
    sideShape.setMargin(margin);
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
    body.setDamping(0, damping);
    body.setFriction(friction);
    body.setActivationState(4);
    return body;
  }

  createCustomShape(def) {
    return Physics.createCustomShape(def);
  }

  static createCustomShape(def) {}

  createConstraint(def) {
    return Physics.createConstraint(def);
  }

  static createConstraint(def) {
    let type = def.type || "point2point";
    let pos = def.position;
    let body1 = def.body1;
    let body2 = def.body2;

    if (type == "point2point") {
      return new _ammo2.default.btPoint2PointConstraint(body1, new _ammo2.default.btVector3(pos.x, pos.y, pos.z));
    }
  }

  addObject(obj) {
    if (obj instanceof _ammo2.default.btRigidBody && this.objects.indexOf(obj) == -1) {
      this.objects.push(obj);
      this.dynamicsWorld.addRigidBody(obj);
    } else if (obj instanceof _ammo2.default.btTypedConstraint && this.constraints.indexOf(obj) == -1) {
      this.constraints.push(obj);
      this.dynamicsWorld.addConstraint(obj);
    }
  }

  updateObject(obj) {
    return this.addObject(obj);
  }

  removeObject(obj) {
    if (obj instanceof _ammo2.default.btRigidBody) {
      this.objects.splice(this.objects.indexOf(obj), 1);
      this.dynamicsWorld.removeRigidBody(obj);
    } else if (obj instanceof _ammo2.default.btPoint2PointConstraint) {
      this.constraints.splice(this.constraints.indexOf(obj), 1);
      this.dynamicsWorld.removeConstraint(obj);
    }
  }

  removeAll(destroy) {
    let world = this.dynamicsWorld;

    for (let obj of this.objects) {
      world.removeRigidBody(obj);
      if (destroy) _ammo2.default.destroy(obj);
    }

    for (let obj of this.constraints) {
      world.removeConstraint(obj);
      if (destroy) _ammo2.default.destroy(obj);
    }

    this.objects = [];
    this.constraints = [];
  }

  setObjectState(body, state) {
    let aVel = state.aVel;
    let lVel = state.lVel;
    let pos = state.pos;
    let rot = state.rot;
    _trans3 = body.getWorldTransform();

    _trans3.setOrigin(new _ammo2.default.btVector3(pos.x, pos.y, pos.z));

    let rows = rot;
    let matrix = new _ammo2.default.btMatrix3x3(rows[0].x, rows[0].y, rows[0].z, rows[1].x, rows[1].y, rows[1].z, rows[2].x, rows[2].y, rows[2].z);

    _trans3.setBasis(matrix);

    body.setAngularVelocity(new _ammo2.default.btVector3(aVel.x, aVel.y, aVel.z));
    body.setLinearVelocity(new _ammo2.default.btVector3(lVel.x, lVel.y, lVel.z));
  }

  getObjectState(body) {
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
      pos,
      rot,
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

  getConstraintState(constraint) {
    let pivotA = constraint.getPivotInA();
    let pivotB = constraint.getPivotInB();
    let i = this.getBodyID(constraint.getRigidBodyA());
    let j = this.getBodyID(constraint.getRigidBodyB());
    return {
      i,
      j,
      a: {
        x: pivotA.x(),
        y: pivotA.y(),
        z: pivotA.z()
      },
      b: {
        x: pivotB.x(),
        y: pivotB.y(),
        z: pivotB.z()
      }
    };
  }

  getBodyID(body) {
    return this.objects.indexOf(body);
  }

  setConstraintState(constraint, state) {}

  state() {
    let states = [];
    let i = 0;

    for (let o of this.objects) {
      let object = o;
      let st = this.getObjectState(object);
      states.push({
        type: "body",
        index: i,
        state: st
      });
      i++;
    }

    i = 0;

    for (let o of this.constraints) {
      let object = o;

      if (object instanceof _ammo2.default.btPoint2PointConstraint) {
        let st = this.getConstraintState(object);
        states.push({
          type: "p2p-constraint",
          index: i,
          state: st
        });
      }

      i++;
    }

    return states;
  }

  setState(states) {
    for (let state of states) {
      if (state.type == "body") {
        this.setObjectState(this.objects[state.index], state.state);
      } else if (state.type == "p2p-constraint") {
        this.setConstraintState(this.constraints[state.index], state.state);
      }
    }
  }

  update(speed) {
    this.dynamicsWorld.stepSimulation(speed, 7);
  }

}

exports.default = Physics;