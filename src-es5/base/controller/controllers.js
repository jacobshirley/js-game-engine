"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Controllers {
  constructor(queue) {
    this.queue = queue;
    this.cont = [];
  }

  add(controller) {
    controller.init(this.queue);
    this.cont.push(controller);
  }

  remove(controller) {
    controller.destroy();
    this.cont.splice(this.cont.indexOf(controller), 1);
  }

  destroy() {
    for (let c of this.cont) {
      c.destroy();
    }

    this.cont = [];
  }

}

exports.default = Controllers;