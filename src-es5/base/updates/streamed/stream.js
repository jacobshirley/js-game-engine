"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iteration = require("../iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class UpdateStream {
  constructor(updates) {
    this.updates = updates || [];
  }

  push(update) {
    this.updates.push(update);
  }

  pushAll(updates) {
    this.updates = this.updates.concat(updates);
  }

  iterator() {
    return new _iteration2.default(this.updates, false);
  }

}

exports.default = UpdateStream;