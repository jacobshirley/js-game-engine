"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateProcessor = require("./update-processor.js");

var _updateProcessor2 = _interopRequireDefault(_updateProcessor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DelegateUpdater extends _updateProcessor2.default {
  constructor(pool, delegate) {
    super(pool);
    this.delegate = delegate;
  }

  setDelegate(delegate) {
    this.delegate = delegate;
  }

  process(update) {
    if (this.delegate) this.delegate.process(update);
  }

}

exports.default = DelegateUpdater;