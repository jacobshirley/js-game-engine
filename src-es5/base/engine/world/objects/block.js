"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _physicsObject = require("../sync/physics-object.js");

var _physicsObject2 = _interopRequireDefault(_physicsObject);

var _namespace = require("../../../namespace.js");

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Block {
  constructor(props) {
    this.props = props;
    this.namespace = (0, _namespace2.default)("base", Block);
  }

  init(physics) {
    let body = physics.createBlock(this.props);
    this.physicsData = {
      body: body
    };
    this.syncer = new _physicsObject2.default(this, physics);
  }

  initRenderer(renderer) {
    //3d rendering
    let mesh = renderer.createBlock(this.props);

    if (mesh) {
      mesh.userData.body = this.physicsData.body;
      mesh.userData.static = this.props.mass == 0;
    }

    this.renderData = {
      mesh: mesh
    };
  }

  synchronizer() {
    return this.syncer;
  }

  copy() {
    return new Block(this.props);
  }

}

exports.default = Block;