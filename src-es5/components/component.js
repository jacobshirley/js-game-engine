"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Component {
  constructor(name) {
    this.name = name;
  }

  getUpdater() {}

  getStateManager() {}

  onDisconnect() {}

  logic(frame) {}

  render() {}

}

exports.default = Component;