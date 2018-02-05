"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iteration = require("../../engine/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _stream = require("../../engine/updates/stream.js");

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Packet = function (_UpdateStream) {
    _inherits(Packet, _UpdateStream);

    function Packet(from, string) {
        _classCallCheck(this, Packet);

        var _this = _possibleConstructorReturn(this, (Packet.__proto__ || Object.getPrototypeOf(Packet)).call(this));

        _this.from = from;
        _this.string = string;
        return _this;
    }

    _createClass(Packet, [{
        key: "decode",
        value: function decode() {
            this.updates = JSON.parse(this.string);
        }
    }, {
        key: "json",
        value: function json() {
            return { server: this.from === 0, from: this.from, data: this.string };
        }
    }, {
        key: "iterator",
        value: function iterator() {
            return new _iteration2.default(this.updates, true);
        }
    }]);

    return Packet;
}(_stream2.default);

exports.default = Packet;