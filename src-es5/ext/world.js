"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ammo = require("./ammo/ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _trans = new _ammo2.default.btTransform(); // taking this out of the loop below us reduces the leaking


class World {
  constructor(engine, renderer, physics) {
    this.objects = [];
    this.stateManagers = [physics];
    this.renderTimer = engine.renderTimer;
    this.queue = engine.queue;
    this.renderer = renderer;
    this.physics = physics;
  }

  getWorldState() {
    let states = [];

    for (let sM of this.stateManagers) {
      states.push(sM.state());
    }

    return states;
  }

  setWorldState(state) {
    for (let i = 0; i < state.length; i++) {
      this.stateManagers[i].setState(state[i]);
    }
  }

  addStateManager(stateManager) {
    this.stateManagers.push(stateManager);
  }

  addObject(gameObj) {
    this.physics.addObject(gameObj.physicsObj);
    if (gameObj.renderObj) this.renderer.addObject(gameObj.renderObj);
    if (this.objects.indexOf(gameObj) == -1) this.objects.push(gameObj);
  }

  updateObject(obj) {
    return this.addObject(obj);
  }

  removeObject(gameObj) {
    this.physics.addObject(gameObj.physicsObj);
    if (gameObj.renderObj) this.renderer.addObject(gameObj.renderObj);
    this.objects.splice(this.objects.indexOf(gameObj), 1);
  }

  removeAll(destroy) {
    this.physics.removeAll(destroy);
    this.renderer.removeAll();
    this.objects = [];
  }

  getDebugString() {
    return "<br />Net updates: " + this.queue.processedUpdates;
  }

  render() {
    for (let obj of this.objects) {
      let body = obj.physicsObj;
      let mesh = obj.renderObj;
      let mS = body.getMotionState();

      if (mS) {
        mS.getWorldTransform(_trans);

        let origin = _trans.getOrigin();

        let rotation = _trans.getRotation();

        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }

    this.renderer.render();
  }

  update(frame) {
    this.physics.update(this.renderTimer.logicInterval / 1000.0);
  }

}

exports.default = World;