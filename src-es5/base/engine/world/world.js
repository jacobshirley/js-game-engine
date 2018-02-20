"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ammo = require("../../shims/ammo.js");

var _ammo2 = _interopRequireDefault(_ammo);

var _objectSynchronizer = require("./sync/object-synchronizer.js");

var _objectSynchronizer2 = _interopRequireDefault(_objectSynchronizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _trans = new _ammo2.default.btTransform(); // taking this out of the loop below us reduces the leaking


const DEFAULT_UPDATE_RATE = 1000 / 60;

class World {
  constructor(game, renderer, physics) {
    this.objects = [];
    this.renderTimer = game.renderTimer;
    this.queue = game.queue;
    this.controllers = game.controllers;
    this.renderer = renderer;
    this.physics = physics; //this.synchronizer = new ObjectSynchronizer(game.multiplayer.local, this);
    //this.queue.addProcessor(this.synchronizer);
  }

  render() {
    for (let obj of this.objects) {
      let body = obj.physicsData.body;
      let mesh = obj.renderData.mesh;
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
    this.physics.update(this.renderTimer.updateInterval / 1000.0);
  }

  reset(state) {
    let newObjects = [];

    for (let object of this.objects) {
      newObjects.push(object.copy());
    }

    this.removeAll(true);
    this.physics.reset();

    for (let object of newObjects) {
      this.addObject(object);
    }

    if (state) this.physics.setAllObjectProps(state);
  }

  addObject(object) {
    object.init(this.physics);
    object.initRenderer(this.renderer);
    this.objects.push(object);
    this.renderer.addObject(object);
    this.physics.addObject(object);
  }

  removeAll(destroy) {
    this.physics.removeAll(destroy);
    this.renderer.removeAll();
    this.objects = [];
  }

  getDebugString() {
    return "<br />Net updates: " + this.queue.processedUpdates;
  }

}

exports.default = World;