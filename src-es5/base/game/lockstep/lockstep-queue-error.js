"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LockstepQueueError = function (_Error) {
    _inherits(LockstepQueueError, _Error);

    function LockstepQueueError(delay) {
        var _ref;

        _classCallCheck(this, LockstepQueueError);

        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = LockstepQueueError.__proto__ || Object.getPrototypeOf(LockstepQueueError)).call.apply(_ref, [this].concat(params)));

        _this.delay = delay;
        _this.message = "Lockstep needs to delay execution";
        return _this;
    }

    return LockstepQueueError;
}(Error);

exports.default = LockstepQueueError;