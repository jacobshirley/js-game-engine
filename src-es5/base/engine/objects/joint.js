"use strict";

_object2.default.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; _object2.default.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object = require("./object.js");

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = _object2.default.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _object2.default.setPrototypeOf ? _object2.default.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Joint = function (_Object) {
    _inherits(Joint, _Object);

    function Joint(props) {
        _classCallCheck(this, Joint);

        return _possibleConstructorReturn(this, (Joint.__proto__ || _object2.default.getPrototypeOf(Joint)).call(this, props));
    }

    _createClass(Joint, [{
        key: "renderable",
        value: function renderable() {
            return false;
        }
    }, {
        key: "init",
        value: function init(physics) {
            this.physicsData.joint = physics.createJoint(this.props);
        }
    }, {
        key: "getType",
        value: function getType() {
            return this.props.type;
        }
    }]);

    return Joint;
}(_object2.default);

exports.default = Joint;