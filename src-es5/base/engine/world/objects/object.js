"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Object {
  constructor(props) {
    this.props = props;
    this.physicsData = {};
    if (this.renderable()) this.renderData = {};
  }

  renderable() {
    return true;
  }

  synchronizer() {}

}

exports.default = Object;