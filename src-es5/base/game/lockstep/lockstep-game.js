"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _game = require("../game.js");

var _game2 = _interopRequireDefault(_game);

var _lockstepQueue = require("./lockstep-queue.js");

var _lockstepQueue2 = _interopRequireDefault(_lockstepQueue);

var _lockstepTimer = require("./lockstep-timer.js");

var _lockstepTimer2 = _interopRequireDefault(_lockstepTimer);

var _gameTimer = require("../../engine/timing/game-timer.js");

var _gameTimer2 = _interopRequireDefault(_gameTimer);

var _interval = require("../../engine/timing/interval.js");

var _interval2 = _interopRequireDefault(_interval);

var _controllers = require("../../controller/controllers.js");

var _controllers2 = _interopRequireDefault(_controllers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LockstepGame = function (_Game) {
    _inherits(LockstepGame, _Game);

    function LockstepGame(config) {
        _classCallCheck(this, LockstepGame);

        var _this = _possibleConstructorReturn(this, (LockstepGame.__proto__ || Object.getPrototypeOf(LockstepGame)).call(this));

        _this.config = config;

        _this.multiplayer = config.multiplayer;
        _this.renderer = config.renderer;

        if (_this.multiplayer.connected) {
            _this._build();
        } else {
            _this.multiplayer.on("connected", function () {
                _this._build();
            });
        }
        return _this;
    }

    _createClass(LockstepGame, [{
        key: "_build",
        value: function _build() {
            var _this2 = this;

            this.queue = new _lockstepQueue2.default(this.multiplayer.getLocalClient(), this.multiplayer.getClients());
            this.timer = new _lockstepTimer2.default(this.queue, 5);

            this.controllers = new _controllers2.default(this.queue);

            this.queue.addProcessor(this.timer);

            this.renderTimer = new _gameTimer2.default(this.timer);

            if (!this.config.headless) {
                this.renderTimer.setRenderFunction(function () {
                    _this2.render();
                });
            } else {
                this.renderTimer.setRenderFunction(function () {});
            }

            this.renderTimer.setLogicFunction(function (frame) {
                _this2.multiplayer.update(frame);
                _this2.queue.update(frame);
                _this2.logic(frame);
            });

            var sendInterval = new _interval2.default(2, true);
            sendInterval.on('complete', function () {
                _this2.multiplayer.flush();
            });

            this.renderTimer.addInterval(sendInterval);

            this.init();
        }
    }, {
        key: "getDebugString",
        value: function getDebugString() {
            return "FPS: " + this.renderTimer.fps + "<br />" + "UPS: " + this.renderTimer.ups + "<br />" + "Frame: " + this.timer.tick;
        }
    }, {
        key: "update",
        value: function update() {
            if (this.multiplayer.connected && this.renderTimer) {
                this.renderTimer.render();
            } else {
                this.multiplayer.update();
            }
        }
    }, {
        key: "start",
        value: function start() {
            var _this3 = this;

            requestAnimationFrame(function () {
                _this3.update();

                requestAnimationFrame(function () {
                    _this3.start();
                });
            });
        }
    }], [{
        key: "isServer",
        get: function get() {
            return this.multiplayer.local.isHost;
        }
    }]);

    return LockstepGame;
}(_game2.default);

exports.default = LockstepGame;