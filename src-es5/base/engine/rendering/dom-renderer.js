"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _renderer = require("./renderer.js");

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DOMRenderer = function (_Renderer) {
  _inherits(DOMRenderer, _Renderer);

  function DOMRenderer(domOwner) {
    _classCallCheck(this, DOMRenderer);

    var _this = _possibleConstructorReturn(this, (DOMRenderer.__proto__ || Object.getPrototypeOf(DOMRenderer)).call(this));

    _this.domOwner = domOwner;
    return _this;
  }

  return DOMRenderer;
}(_renderer2.default);

exports.default = DOMRenderer;