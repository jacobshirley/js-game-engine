"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _renderTimer = require("./render-timer.js");

var _renderTimer2 = _interopRequireDefault(_renderTimer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_UPDATE_RATE = 1000 / 60;

var GameTimer = function (_RenderTimer) {
	_inherits(GameTimer, _RenderTimer);

	function GameTimer(timer, renderFunc, logicFunc) {
		_classCallCheck(this, GameTimer);

		var _this = _possibleConstructorReturn(this, (GameTimer.__proto__ || Object.getPrototypeOf(GameTimer)).call(this));

		_this.renderFunc = renderFunc || function () {};
		_this.logicFunc = logicFunc || function () {};

		_this.updateInterval = DEFAULT_UPDATE_RATE;
		_this.updateTimer = timer || new _timer2.default();

		_this.renderTime = 0;
		_this.updateTime = 0;
		_this.fps = 0;
		_this.tempFPS = 0;

		_this.ups = 0;
		_this.tempUPS = 0;
		return _this;
	}

	_createClass(GameTimer, [{
		key: "setRenderFunction",
		value: function setRenderFunction(func) {
			this.renderFunc = func;
		}
	}, {
		key: "setLogicFunction",
		value: function setLogicFunction(func) {
			this.logicFunc = func;
		}
	}, {
		key: "setUpdateRate",
		value: function setUpdateRate(updateRate) {
			this.updateInterval = 1000 / updateRate;
		}
	}, {
		key: "getDebugString",
		value: function getDebugString() {
			return "Tick: " + this.updateTimer.tick + "<br /> Time (ms): " + this.updateTimer.time + "<br /> FPS: " + this.fps + "<br /> UPS: " + this.ups;
		}
	}, {
		key: "update",
		value: function update() {
			var _this2 = this;

			var t = 0;

			while (this.updateTime >= this.updateInterval && t < 20) {
				// < 7 so it can catch up and doesn't go crazy
				if (!this.updateTimer.update(function () {
					_this2.logicFunc(_this2.updateTimer.tick);

					t++;

					_this2.updateTime -= _this2.updateInterval;
					_this2.tempUPS++;

					return true;
				})) {
					this.updateTime -= this.updateInterval;
				}
			}
		}
	}, {
		key: "render",
		value: function render() {
			var _this3 = this;

			return _get(GameTimer.prototype.__proto__ || Object.getPrototypeOf(GameTimer.prototype), "update", this).call(this, function () {
				_this3.update();
				_this3.renderFunc();

				_this3.renderTime += _this3.deltaTime;
				_this3.updateTime += _this3.deltaTime;
				_this3.tempFPS++;

				if (_this3.renderTime >= 1000) {
					_this3.fps = _this3.tempFPS;
					_this3.ups = _this3.tempUPS;

					_this3.renderTime = 0;
					_this3.tempFPS = 0;
					_this3.tempUPS = 0;
				}

				return true;
			});
		}
	}]);

	return GameTimer;
}(_renderTimer2.default);

exports.default = GameTimer;