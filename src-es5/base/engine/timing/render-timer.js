"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _delay = require("./delay.js");

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RenderTimer = function (_Timer) {
	_inherits(RenderTimer, _Timer);

	function RenderTimer() {
		_classCallCheck(this, RenderTimer);

		var _this = _possibleConstructorReturn(this, (RenderTimer.__proto__ || Object.getPrototypeOf(RenderTimer)).call(this));

		_this.delay = null;
		return _this;
	}

	_createClass(RenderTimer, [{
		key: "setMaxFrames",
		value: function setMaxFrames(max) {
			var delay = new MaxFrameDelay(1000.0 / max);
			if (this.delay == null) {
				this.delay = delay;
				this.addDelay(this.delay);
			}
		}
	}, {
		key: "render",
		value: function render() {}
	}]);

	return RenderTimer;
}(_timer2.default);

exports.default = RenderTimer;

var MaxFrameDelay = function (_Delay) {
	_inherits(MaxFrameDelay, _Delay);

	function MaxFrameDelay(frameInterval) {
		_classCallCheck(this, MaxFrameDelay);

		var _this2 = _possibleConstructorReturn(this, (MaxFrameDelay.__proto__ || Object.getPrototypeOf(MaxFrameDelay)).call(this));

		_this2.frameInterval = frameInterval;
		return _this2;
	}

	_createClass(MaxFrameDelay, [{
		key: "delete",
		value: function _delete() {
			return false;
		}
	}, {
		key: "start",
		value: function start() {
			this.then = counter.time;
		}
	}, {
		key: "complete",
		value: function complete() {
			var now = counter.time;
			var delta = now - this.then;

			if (delta > this.frameInterval) {
				this.emit('complete');
				this.then = now - delta % this.frameInterval;
				return true;
			}
			return false;
		}
	}]);

	return MaxFrameDelay;
}(_delay2.default);