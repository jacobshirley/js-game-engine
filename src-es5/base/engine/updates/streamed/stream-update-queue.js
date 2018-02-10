"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _updateQueue = require("../update-queue.js");

var _updateQueue2 = _interopRequireDefault(_updateQueue);

var _iteration = require("../iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StreamUpdateQueue = function (_UpdateQueue) {
	_inherits(StreamUpdateQueue, _UpdateQueue);

	function StreamUpdateQueue(local, clients) {
		_classCallCheck(this, StreamUpdateQueue);

		var _this = _possibleConstructorReturn(this, (StreamUpdateQueue.__proto__ || Object.getPrototypeOf(StreamUpdateQueue)).call(this));

		_this.local = local;
		_this.clients = clients;

		_this.toBeFramed = [];
		return _this;
	}

	_createClass(StreamUpdateQueue, [{
		key: "push",
		value: function push(update, networked) {
			this.local.push(update, networked);
		}
	}, {
		key: "pushFramed",
		value: function pushFramed(update, networked) {
			this.local.pushFramed(update, networked);
		}
	}, {
		key: "update",
		value: function update(frame) {}
	}, {
		key: "isHost",
		get: function get() {
			return this.local.host();
		}
	}]);

	return StreamUpdateQueue;
}(_updateQueue2.default);

exports.default = StreamUpdateQueue;