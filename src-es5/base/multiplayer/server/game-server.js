"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ws = require("ws");

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../../engine/updates/client.js");

var _clientStream = require("../../engine/updates/streamed/client-stream.js");

var _packet = require("./packet.js");

var _packet2 = _interopRequireDefault(_packet);

var _client2 = require("./client.js");

var _client3 = _interopRequireDefault(_client2);

var _multiplayer = require("../multiplayer.js");

var _multiplayer2 = _interopRequireDefault(_multiplayer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function encode(from, object) {
    return new _packet2.default(from, JSON.stringify(object));
}

var GameServer = function (_Multiplayer) {
    _inherits(GameServer, _Multiplayer);

    function GameServer(port) {
        _classCallCheck(this, GameServer);

        var _this = _possibleConstructorReturn(this, (GameServer.__proto__ || Object.getPrototypeOf(GameServer)).call(this));

        _this.wss = new _ws.Server({ port: port });
        _this.local = _this.clients.push(new _clientStream.LocalClientUpdateStream());
        _this.clients.setHost(_this.local.id());

        _this.packets = [];
        _this.wss.on('connection', function (ws) {
            var cl = _this.clients.push(new _client3.default(ws));
            var local = [];

            /*if (this.clients.length() == 2) {
                this.clients.setHost(cl.id());
            }*/

            console.log("Added client " + cl.id());
            ws.id = cl.id();

            local.push({ name: "CONNECTED", id: cl.id(), isHost: cl.host() });
            local.push({ name: "CLIENTS_LIST", list: _this.clients.export() });
            local.push({ name: "SET_HOST", id: _this.clients.hostId });

            cl.send([encode(_this.local.id(), local).json()]);

            _this.local.push({ name: "CLIENT_ADDED", id: cl.id(), isHost: cl.host() });
            _this.packets.push(encode(_this.local.id(), [{ name: "CLIENT_ADDED", id: cl.id(), isHost: cl.host() }]));

            ws.on('message', function (message) {
                cl.cache(JSON.parse(message));
                _this.packets.push(new _packet2.default(cl.id(), message));
            });

            ws.on('close', function (ws2) {
                //console.log("attempting to remove");

                _this.packets.push(encode(_this.local.id(), [{ name: "CLIENT_REMOVED", id: cl.id() }]));
            });
        });

        _this.emit("connected");
        _this.connected = true;
        return _this;
    }

    _createClass(GameServer, [{
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
        key: "update",
        value: function update(frame) {
            this.recv();
            this.local.update(frame);
        }
    }, {
        key: "flush",
        value: function flush() {
            var hostClient = this.clients.host();
            var it = this.clients.iterator();
            var c = 0;

            var localUpdatePacket = encode(this.local.id(), this.local.toBeSent.splice(0)).json();

            while (it.hasNext()) {
                var client = it.next();

                if (client != this.local) {
                    var clUpdates = [localUpdatePacket];

                    for (var i = 0; i < this.packets.length; i++) {
                        var p = this.packets[i];

                        if (p.from != client.id()) {
                            clUpdates.push(p.json());
                        }
                    }

                    if (clUpdates.length > 0) {
                        try {
                            client.send(clUpdates);
                        } catch (e) {
                            //console.log(client.id()+", " + c+", "+this.clients.length());
                            this.clients.remove(client.id());
                            //console.log(client.id()+", " + c+", "+this.clients.length());
                            //console.log(e.message);
                        }
                    }
                }

                c++;
            }

            this.packets = [];
        }
    }]);

    return GameServer;
}(_multiplayer2.default);

exports.default = GameServer;