"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateProcessor = require("../../base/updates/update-processor.js");

var _updateProcessor2 = _interopRequireDefault(_updateProcessor);

var _physics = require("../ammo/physics.js");

var _physics2 = _interopRequireDefault(_physics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PickerBase extends _updateProcessor2.default {
  constructor(pool, physics) {
    super(pool);
    this.physics = physics;
    this.handles = [];

    for (let i = 0; i < 100; i++) this.handles.push(null);

    this.us = 0;
  }

  state() {
    let state = [];
    let c = 0;

    for (let h of this.handles) {
      if (h != null) {
        let index = this.physics.getBodyID(h.getRigidBodyA());
        state.push({
          i: c,
          index: index,
          handle: this.physics.getConstraintState(h)
        });
      }

      c++;
    }

    return state;
  }

  setState(state) {
    for (let st of state) {
      let h = st.handle;
      let body1 = this.physics.objects[st.index];
      this.handles[st.i] = _physics2.default.createConstraint({
        type: "point2point",
        body1: body1,
        position: h.a
      });
      this.physics.addObject(this.handles[st.i]);
    }
  }

  process(update) {
    if (update.name == "PICKER_START_DRAG") {
      this.us++;
      let body = this.physics.objects[update.index];
      let pos = update.data;
      this.handles[update.__clId] = _physics2.default.createConstraint({
        type: "point2point",
        body1: body,
        position: pos
      });
      this.physics.addObject(this.handles[update.__clId]);
    } else if (update.name == "PICKER_DRAG") {
      this.us++;
      let intersection = update.data;

      this.handles[update.__clId].setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
    } else if (update.name == "PICKER_STOP_DRAG") {
      this.us++;
      let handle = this.handles[update.__clId];
      this.physics.removeObject(handle);
      Ammo.destroy(handle);
      this.handles[update.__clId] = null;
    }
  }

}

exports.default = PickerBase;