"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MouseController = function (_EventEmitter) {
    _inherits(MouseController, _EventEmitter);

    function MouseController(id, networked) {
        _classCallCheck(this, MouseController);

        var _this = _possibleConstructorReturn(this, (MouseController.__proto__ || Object.getPrototypeOf(MouseController)).call(this));

        _this.id = id;
        _this.x = 0;
        _this.y = 0;
        _this.mouseDown = false;

        _this.realX = 0;
        _this.realY = 0;
        _this.realMouseDown = false;

        _this.networked = networked;
        _this.userData = {};
        return _this;
    }

    _createClass(MouseController, [{
        key: "init",
        value: function init(queue) {
            var _this2 = this;

            this.queue = queue;

            $(window).mousedown(function (event) {
                event.preventDefault();

                _this2.realX = event.clientX / window.innerWidth * 2 - 1;
                _this2.realY = -(event.clientY / window.innerHeight) * 2 + 1;
                _this2.realMouseDown = true;

                _this2.queue.pushFramed({ name: "MOUSE_DOWN", mouseDown: _this2.realMouseDown, x: _this2.realX, y: _this2.realY }, _this2.networked);
            });

            $(window).mouseup(function (event) {
                event.preventDefault();

                _this2.realX = event.clientX / window.innerWidth * 2 - 1;
                _this2.realY = -(event.clientY / window.innerHeight) * 2 + 1;
                _this2.realMouseDown = false;

                _this2.queue.pushFramed({ name: "MOUSE_UP", mouseDown: _this2.realMouseDown, x: _this2.realX, y: _this2.realY }, _this2.networked);
            });

            $(window).mousemove(function (event) {
                event.preventDefault();

                _this2.realX = event.clientX / window.innerWidth * 2 - 1;
                _this2.realY = -(event.clientY / window.innerHeight) * 2 + 1;

                _this2.queue.pushFramed({ name: "MOUSE_MOVE", x: _this2.realX, y: _this2.realY }, _this2.networked);
            });

            this.queue.addProcessor(this);
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.queue.addProcessor(remove);
        }
    }, {
        key: "process",
        value: function process(update) {
            if (update.name == "MOUSE_DOWN") {
                this.x = update.x;
                this.y = update.y;
                this.mouseDown = update.mouseDown;

                this.emit("mousedown", this);
            } else if (update.name == "MOUSE_UP") {
                this.x = update.x;
                this.y = update.y;
                this.mouseDown = update.mouseDown;

                this.emit("mouseup", this);
            } else if (update.name == "MOUSE_MOVE") {
                this.x = update.x;
                this.y = update.y;

                this.updates++;
                this.emit("mousemove", this);
            }
        }
    }]);

    return MouseController;
}(_events2.default);

exports.default = MouseController;