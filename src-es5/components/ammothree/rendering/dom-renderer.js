"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _renderer = require("./renderer.js");

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DOMRenderer {
  constructor(domOwner) {
    this.domOwner = domOwner;
    this.tabActive = true;
    $(window).focus(() => {
      this.tabActive = true;
    });
    $(window).blur(() => {
      this.tabActive = false;
    });
    $(window).resize(() => {
      this.resize(window.innerWidth, window.innerHeight);
    });
  }

}

exports.default = DOMRenderer;