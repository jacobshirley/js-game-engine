"use strict";

_object2.default.defineProperty(exports, "__esModule", {
  value: true
});

var _object = require("./object.js");

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Joint extends _object2.default {
  constructor(props) {
    super(props);
  }

  renderable() {
    return false;
  }

  init(physics) {
    this.physicsData.joint = physics.createJoint(this.props);
  }

  getType() {
    return this.props.type;
  }

}

exports.default = Joint;