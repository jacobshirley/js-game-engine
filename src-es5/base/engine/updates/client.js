"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ClientList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iteration = require("./iteration.js");

var _iteration2 = _interopRequireDefault(_iteration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
	function Client(id, isHost) {
		_classCallCheck(this, Client);

		this._id = id;
		this._isHost = isHost;
	}

	_createClass(Client, [{
		key: "host",
		value: function host(value) {
			if (typeof value === "undefined") {
				return this._isHost;
			}

			this._isHost = value;
			return this._isHost;
		}
	}, {
		key: "id",
		value: function id(value) {
			if (typeof value === "undefined") {
				return this._id;
			}

			this._id = value;
			return this._id;
		}
	}]);

	return Client;
}();

exports.default = Client;

var ClientList = exports.ClientList = function () {
	function ClientList() {
		_classCallCheck(this, ClientList);

		this.hostId = -1;
		this.arr = [];
		this.arrIds = [];
	}

	_createClass(ClientList, [{
		key: "length",
		value: function length() {
			return this.arr.length;
		}
	}, {
		key: "has",
		value: function has(id) {
			return this.arrIds.indexOf(id) != -1;
		}
	}, {
		key: "get",
		value: function get(id) {
			return this.arr[this.arrIds.indexOf(id)];
		}
	}, {
		key: "_newId",
		value: function _newId() {
			for (var i = 0; i < this.length(); i++) {
				if (!this.has(i)) {
					return i;
				}
			}

			return this.arr.length;
		}
	}, {
		key: "push",
		value: function push(client) {
			var id = client.id();
			var isSet = !(typeof id === 'undefined');

			if (!isSet || id == -1) {
				id = this._newId();
			}

			if (isSet && id != -1 && this.has(id)) {
				client.id(id);
				client.host(client.host() || false);
				return this.set(client);
			}

			client.id(id);
			client.host(client.host() || false);

			if (client.host()) {
				this.hostId = id;
			}

			this.arr.push(client);
			this.arrIds.push(id);

			return client;
		}
	}, {
		key: "set",
		value: function set(client) {
			var index = this.arrIds.indexOf(client.id());
			this.arr[index] = client;
			return client;
		}
	}, {
		key: "remove",
		value: function remove(id) {
			var i = this.arrIds.indexOf(id);
			if (i != -1) {
				this.arr.splice(i, 1);
				this.arrIds.splice(i, 1);
			}
		}
	}, {
		key: "setHost",
		value: function setHost(id) {
			if (this.has(id)) {
				if (this.hostId > -1) {
					this.get(this.hostId).host(false);
				}

				this.hostId = id;
				var stream = this.get(id);
				stream.host(true);
			}
		}
	}, {
		key: "host",
		value: function host() {
			return this.get(this.hostId);
		}
	}, {
		key: "export",
		value: function _export() {
			var clients = [];
			var it = this.iterator();
			while (it.hasNext()) {
				var cl = it.remove();
				clients.push({ id: cl.id(), isHost: cl.host() });
			}
			return clients;
		}
	}, {
		key: "iterator",
		value: function iterator() {
			return new _iteration2.default(this.arr, true);
		}
	}]);

	return ClientList;
}();