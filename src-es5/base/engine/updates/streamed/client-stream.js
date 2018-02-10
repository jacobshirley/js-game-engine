"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LocalClientUpdateStream = exports.ClientUpdateStream = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require("../client.js");

var _client2 = _interopRequireDefault(_client);

var _iteration = require("../iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClientUpdateStream = exports.ClientUpdateStream = function (_Client) {
	_inherits(ClientUpdateStream, _Client);

	function ClientUpdateStream(id, isHost) {
		_classCallCheck(this, ClientUpdateStream);

		var _this = _possibleConstructorReturn(this, (ClientUpdateStream.__proto__ || Object.getPrototypeOf(ClientUpdateStream)).call(this, id, isHost));

		_this.updates = [];
		_this._cachedUpdates = [];
		return _this;
	}

	/*updates() {
 	return this.updates;
 }*/

	_createClass(ClientUpdateStream, [{
		key: "push",
		value: function push(update) {
			this.updates.push(update);
		}
	}, {
		key: "cache",
		value: function cache(updates) {
			this._cachedUpdates = this._cachedUpdates.concat(updates);
		}
	}, {
		key: "recv",
		value: function recv() {
			this.updates = this.updates.concat(this._cachedUpdates.splice(0));
		}
	}, {
		key: "iterator",
		value: function iterator() {
			return new _iteration2.default(this.updates, false);
		}
	}]);

	return ClientUpdateStream;
}(_client2.default);

var LocalClientUpdateStream = exports.LocalClientUpdateStream = function (_ClientUpdateStream) {
	_inherits(LocalClientUpdateStream, _ClientUpdateStream);

	function LocalClientUpdateStream(connection, id, isHost) {
		_classCallCheck(this, LocalClientUpdateStream);

		var _this2 = _possibleConstructorReturn(this, (LocalClientUpdateStream.__proto__ || Object.getPrototypeOf(LocalClientUpdateStream)).call(this, id, isHost));

		_this2.connection = connection;
		_this2.localUpdates = [];
		_this2.toBeSent = [];
		_this2.toBeFramed = [];
		_this2.toBeFramedNet = [];
		return _this2;
	}

	_createClass(LocalClientUpdateStream, [{
		key: "push",
		value: function push(update, networked) {
			if (networked) {
				_get(LocalClientUpdateStream.prototype.__proto__ || Object.getPrototypeOf(LocalClientUpdateStream.prototype), "push", this).call(this, update);
				this.toBeSent.push(update);
			} else {
				this.localUpdates.push(update);
			}
		}
	}, {
		key: "pushFramed",
		value: function pushFramed(update, networked) {
			if (networked) this.toBeFramedNet.push(update);else this.toBeFramed.push(update);
		}
	}, {
		key: "stage",
		value: function stage(updates, frame, networked) {
			while (updates.length > 0) {
				var u = updates.shift();
				u.frame = frame;
				this.push(u, networked);
			}
		}
	}, {
		key: "update",
		value: function update(frame) {
			this.stage(this.toBeFramed, frame, false);
			this.stage(this.toBeFramedNet, frame, true);
		}
	}, {
		key: "flush",
		value: function flush() {
			var updates = this.toBeSent;

			if (updates.length > 0) {
				this.connection.send(updates.splice(0));
			}
		}
	}]);

	return LocalClientUpdateStream;
}(ClientUpdateStream);