"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../client-stream.js");

var _iteration = require("../../engine/updates/iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerConnection = function (_Multiplayer) {
	_inherits(ServerConnection, _Multiplayer);

	function ServerConnection(connection) {
		var _ref;

		_classCallCheck(this, ServerConnection);

		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		var _this = _possibleConstructorReturn(this, (_ref = ServerConnection.__proto__ || Object.getPrototypeOf(ServerConnection)).call.apply(_ref, [this].concat(args)));

		_this.local = null;
		_this.clients = new _client.ClientList();
		//this.clients.push(new ClientUpdateStream(0, true));

		_this.connection = connection;
		_this.connected = false;

		_this.queue = null;

		_this.serverUpdates = [];

		_this.connection.on('message', function (data) {
			for (var i = 0; i < data.length; i++) {
				var updates = data[i];
				var data2 = JSON.parse(updates.data);

				if (updates.server) {
					_this.serverUpdates = _this.serverUpdates.concat(data2);
				}

				var client = _this.clients.get(updates.from);
				//console.log("from: "+this.clients.get(updates.from));
				if (!client) {
					//console.log("create");
					client = _this.clients.push(new _clientStream.ClientUpdateStream(updates.from));
				}

				client._cachedUpdates = client._cachedUpdates.concat(data2);
			}
		});
		return _this;
	}

	_createClass(ServerConnection, [{
		key: "getLocalClient",
		value: function getLocalClient() {
			return this.local;
		}
	}, {
		key: "getClients",
		value: function getClients() {
			return this.clients;
		}
	}, {
		key: "flush",
		value: function flush() {
			var updates = this.localUpdates;

			if (updates.length > 0) {
				this.connection.send(updates.splice(0));
			}

			this.local.flush();
		}
	}, {
		key: "update",
		value: function update(frame) {
			while (this.serverUpdates.length > 0) {
				this.process(this.serverUpdates.shift());
			}
		}
	}, {
		key: "process",
		value: function process(update) {
			if (update.name == "CONNECTED") {
				this.local = this.clients.push(new _clientStream.LocalClientUpdateStream(this.connection, update.id, update.isHost));
				this.connected = true;

				this.emit("connected", this.local);
			} else if (update.name == "CLIENT_ADDED") {
				var nC = this.clients.push(new _clientStream.ClientUpdateStream(update.id, update.isHost));

				this.emit("client-added", nC);
			} else if (update.name == "CLIENTS_LIST") {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = update.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var cl = _step.value;

						if (this.local.id() != cl.id) {
							//console.log(cl.id + ", " + this.clients.has(cl.id));
							var cl2 = this.clients.push(new _clientStream.ClientUpdateStream(cl.id, cl.isHost));
							//console.log(this.clients.length());
							this.emit("client-added", cl2);
						}
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
			} else if (update.name == "CLIENT_REMOVED") {
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = update.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var id = _step2.value;

						this.clients.remove(id);

						this.emit("client-removed", id);
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
			} else if (update.name == "SET_HOST") {
				this.clients.setHost(update.id);

				this.emit("set-host", update.id);
			}
		}
	}, {
		key: "destory",
		value: function destory() {}
	}]);

	return ServerConnection;
}(_multiplayer2.default);

exports.default = ServerConnection;