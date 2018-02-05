'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SERVER_ID = 0;

var Connection = function (_EventEmitter) {
	_inherits(Connection, _EventEmitter);

	function Connection() {
		_classCallCheck(this, Connection);

		var _this = _possibleConstructorReturn(this, (Connection.__proto__ || Object.getPrototypeOf(Connection)).call(this));

		_this.connected = false;
		return _this;
	}

	_createClass(Connection, [{
		key: 'disconnect',
		value: function disconnect() {}
	}, {
		key: 'send',
		value: function send(data) {}
	}, {
		key: 'isConnected',
		get: function get() {
			return this.connected;
		}
	}]);

	return Connection;
}(EventEmitter);

exports.default = Connection;

var WebSocketConnection = exports.WebSocketConnection = function (_Connection) {
	_inherits(WebSocketConnection, _Connection);

	function WebSocketConnection(ip) {
		_classCallCheck(this, WebSocketConnection);

		var _this2 = _possibleConstructorReturn(this, (WebSocketConnection.__proto__ || Object.getPrototypeOf(WebSocketConnection)).call(this));

		_this2.ip = ip;
		_this2.ws = new WebSocket(ip);

		_this2.ws.onopen = function () {
			_this2.connected = true;
			_this2.emit('connected');
		};

		_this2.ws.onclose = function () {
			_this2.connected = false;
			_this2.emit('disconnected');
		};

		_this2.ws.onerror = function (ev) {
			_this2.emit('error', ev);
		};

		_this2.ws.onmessage = function (ev) {
			_this2.emit('message', JSON.parse(ev.data));
		};
		return _this2;
	}

	_createClass(WebSocketConnection, [{
		key: 'send',
		value: function send(data) {
			if (this.connected) this.ws.send(JSON.stringify(data));
		}
	}]);

	return WebSocketConnection;
}(Connection);

var TestConnection = exports.TestConnection = function (_Connection2) {
	_inherits(TestConnection, _Connection2);

	function TestConnection(latency, packetLossChance) {
		_classCallCheck(this, TestConnection);

		var _this3 = _possibleConstructorReturn(this, (TestConnection.__proto__ || Object.getPrototypeOf(TestConnection)).call(this));

		_this3.latency = latency;
		_this3.packetLossChance = packetLossChance;

		_this3.connected = true;
		_this3.emit('connected');

		_this3.data = [];
		_this3.data.push({ server: true, data: JSON.stringify([{ name: "CONNECTED", id: 0, isHost: true }]) });
		_this3.data.push({ server: true, data: JSON.stringify([{ name: "CLIENTS_LIST", list: [{ id: 0, isHost: true }] }]) });

		setInterval(function () {
			if (_this3.data.length > 0 && Math.random() > _this3.packetLossChance) {
				_this3.emit('message', _this3.data);
			}
			_this3.data = [];
		}, _this3.latency);
		return _this3;
	}

	_createClass(TestConnection, [{
		key: 'send',
		value: function send(data) {
			//this.data = this.data.concat({from: 1, data: data});
		}
	}]);

	return TestConnection;
}(Connection);