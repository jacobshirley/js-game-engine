"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _counter = require("./counter.js");

var _counter2 = _interopRequireDefault(_counter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Timer = function (_Counter) {
	_inherits(Timer, _Counter);

	function Timer() {
		_classCallCheck(this, Timer);

		var _this = _possibleConstructorReturn(this, (Timer.__proto__ || Object.getPrototypeOf(Timer)).call(this));

		_this.delayCounter = new _counter2.default();
		_this.delays = [];

		_this.intervals = [];

		_this.parent = null;
		_this.tetherables = [];

		_this.delayed = false;
		_this.paused = false;
		return _this;
	}

	_createClass(Timer, [{
		key: "reset",
		value: function reset() {
			this.tick = 0;
			this.delays = [];
			this.intervals = [];
		}
	}, {
		key: "addDelay",
		value: function addDelay(delay) {
			delay.start(this.delayCounter);

			this.delays.push(delay);
		}
	}, {
		key: "addInterval",
		value: function addInterval(interval) {
			interval.reset(this);

			this.intervals.push(interval);
		}
	}, {
		key: "addTetherable",
		value: function addTetherable(child) {
			this.tetherables.push(child);
		}
	}, {
		key: "removeTetherable",
		value: function removeTetherable(child) {
			this.tetherables.splice(this.tetherables.indexOf(child), 1);
		}
	}, {
		key: "tether",
		value: function tether(parent) {
			this.parent = parent;
			this.parent.addTetherable(this);
		}
	}, {
		key: "untether",
		value: function untether() {
			this.parent = null;
			this.parent.removeTetherable(this);
		}
	}, {
		key: "setTick",
		value: function setTick(newTick) {
			this.tick = newTick;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.intervals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var interval = _step.value;

					interval.reset(this);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: "getTick",
		value: function getTick() {
			return this.tick;
		}
	}, {
		key: "update",
		value: function update(main) {
			if (!this.paused) {
				this.delayCounter.update(this);

				var delayed = false;
				var delays = this.delays;

				for (var i = 0; i < delays.length; i++) {
					var delay = delays[i];
					if (!delay.complete(this.delayCounter)) delayed = true;else if (delay.delete()) {
						delays.splice(i, 1);
					}
				}

				if (delayed) {
					return false;
				}

				if (!this.parent) {
					_get(Timer.prototype.__proto__ || Object.getPrototypeOf(Timer.prototype), "update", this).call(this);
				} else {
					this.tick = this.parent.tick;
					this.time = this.parent.time;
				}

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.tetherables[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var tetherable = _step2.value;

						tetherable.tick = this.tick;
						tetherable.time = this.time;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = this.intervals[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var interval = _step3.value;

						interval.update(this);
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				if (main) return main();
			}

			return false;
		}
	}], [{
		key: "currentTime",
		get: function get() {
			return Date.now();
		}
	}]);

	return Timer;
}(_counter2.default);

exports.default = Timer;