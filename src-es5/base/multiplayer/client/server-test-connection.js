"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../client-stream.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerTestConnection = function (_Multiplayer) {
    _inherits(ServerTestConnection, _Multiplayer);

    function ServerTestConnection() {
        _classCallCheck(this, ServerTestConnection);

        var _this = _possibleConstructorReturn(this, (ServerTestConnection.__proto__ || Object.getPrototypeOf(ServerTestConnection)).call(this));

        _this.local = new _clientStream.LocalClientUpdateStream(null, 0, true);
        _this.clients = new _client.ClientList();
        _this.clients.push(_this.local);
        _this.clients.setHost(0);

        _this.connected = true;
        _this.emit("connected", _this.local);
        return _this;
    }

    _createClass(ServerTestConnection, [{
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
        value: function flush() {}
    }, {
        key: "update",
        value: function update(frame) {}
    }]);

    return ServerTestConnection;
}(_multiplayer2.default);

exports.default = ServerTestConnection;