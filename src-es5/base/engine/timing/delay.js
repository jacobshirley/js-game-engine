'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('../../shims/events.js');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Delay = function (_EventEmitter) {
	_inherits(Delay, _EventEmitter);

	function Delay(delay, useTicks) {
		_classCallCheck(this, Delay);

		var _this = _possibleConstructorReturn(this, (Delay.__proto__ || Object.getPrototypeOf(Delay)).call(this));

		_this.delay = delay;
		_this.useTicks = useTicks;

		_this.marker = 0;
		return _this;
	}

	_createClass(Delay, [{
		key: 'delete',
		value: function _delete(counter) {
			return true;
		}
	}, {
		key: 'start',
		value: function start(counter) {
			if (!counter) return;

			var i = counter.tick;
			if (!this.useTicks) i = counter.time;

			this.marker = i + this.delay;
		}
	}, {
		key: 'complete',
		value: function complete(counter) {
			if (!counter) return false;

			var i = counter.tick;
			if (!this.useTicks) i = counter.time;

			var bool = i >= this.marker;
			if (bool) {
				this.emit('complete');
			} else {
				this.emit('delay');
			}
			return bool;
		}
	}]);

	return Delay;
}(_events2.default);

exports.default = Delay;