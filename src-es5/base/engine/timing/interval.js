"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Interval = function (_EventEmitter) {
	_inherits(Interval, _EventEmitter);

	function Interval(target, useTicks) {
		_classCallCheck(this, Interval);

		var _this = _possibleConstructorReturn(this, (Interval.__proto__ || Object.getPrototypeOf(Interval)).call(this));

		_this.target = target;
		_this.inc = 0;
		_this.useTicks = useTicks;
		return _this;
	}

	_createClass(Interval, [{
		key: "reset",
		value: function reset(counter) {
			this.inc = 0;
		}
	}, {
		key: "update",
		value: function update(counter) {
			var i = counter.deltaTime;
			if (this.useTicks) i = 1;

			this.inc += i;
			if (this.inc >= this.target) {
				this.emit('complete');
				this.reset();
			}
		}
	}]);

	return Interval;
}(_events2.default);

exports.default = Interval;