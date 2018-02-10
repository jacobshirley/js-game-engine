"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _timer = require("../../engine/timing/timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _interval = require("../../engine/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _delay = require("../../engine/timing/delay.js");

var _delay2 = _interopRequireDefault(_delay);

var _lockstepQueueError = require("./lockstep-queue-error.js");

var _lockstepQueueError2 = _interopRequireDefault(_lockstepQueueError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LockstepTimer = function (_Timer) {
	_inherits(LockstepTimer, _Timer);

	function LockstepTimer(client, delay) {
		var minDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
		var maxDelay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 50;
		var syncInterval = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 5;

		_classCallCheck(this, LockstepTimer);

		var _this = _possibleConstructorReturn(this, (LockstepTimer.__proto__ || Object.getPrototypeOf(LockstepTimer)).call(this));

		_this.init = false;
		_this.client = client;
		_this.delay = delay;
		_this.minDelay = minDelay;
		_this.maxDelay = maxDelay;
		_this.syncInterval = syncInterval;
		_this._resetTick = 0;

		if (_this.client.isHost) {
			var interval = new _interval2.default(syncInterval, true);

			interval.on('complete', function () {
				_this.client.push({ name: "HOST_TICK", tick: _this.tick, time: _this.time }, true);
			});

			_this.addInterval(interval);
		}
		return _this;
	}

	_createClass(LockstepTimer, [{
		key: "update",
		value: function update(main) {
			try {
				return _get(LockstepTimer.prototype.__proto__ || Object.getPrototypeOf(LockstepTimer.prototype), "update", this).call(this, main);
			} catch (e) {
				if (e instanceof _lockstepQueueError2.default) {
					console.log("LockstepError: Delaying");
					this.addDelay(new _delay2.default(this.delay, true));
				} else throw e;
			}
		}
	}, {
		key: "process",
		value: function process(update) {
			if (this.client.isHost) {
				if (update.name == "CLIENT_ADDED") {
					//console.log("client added");
					this.client.push({ name: "INIT_TICK", tick: this.tick, time: this.time }, true);
				}

				return;
			}

			if (update.name == "HOST_TICK") {
				if (!this.init) return;

				var diff = update.tick - this.tick;

				if (this._resetTick < update.tick && diff <= this.minDelay) {
					//console.log("Delaying " + diff);

					this._resetTick += this.delay;
					this.addDelay(new _delay2.default(this.delay, true));
				}
			} else if (update.name == "INIT_TICK") {
				if (this.init) return;

				//console.log("init");

				this.tick = update.tick - 1;
				this.time = update.time;

				this._resetTick = this.tick + this.delay;
				this.addDelay(new _delay2.default(this.delay, true));

				this.init = true;
			}
		}
	}]);

	return LockstepTimer;
}(_timer2.default);

exports.default = LockstepTimer;