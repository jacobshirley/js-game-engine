"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

var _client = require("../engine/updates/client.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Multiplayer = function (_EventEmitter) {
    _inherits(Multiplayer, _EventEmitter);

    function Multiplayer() {
        _classCallCheck(this, Multiplayer);

        var _this = _possibleConstructorReturn(this, (Multiplayer.__proto__ || Object.getPrototypeOf(Multiplayer)).call(this));

        _this.clients = new _client.ClientList();

        _this.localUpdates = [];
        _this.queueR = [];
        return _this;
    }

    _createClass(Multiplayer, [{
        key: "push",
        value: function push(update) {
            //this.localUpdates.push(update);
        }
    }, {
        key: "recv",
        value: function recv() {
            var clients = this.clients.iterator();

            while (clients.hasNext()) {
                clients.remove().recv();
            }
        }
    }, {
        key: "queueRemove",
        value: function queueRemove(client) {
            this.queueR.push(client);
        }
    }, {
        key: "getLocalClient",
        value: function getLocalClient() {}
    }, {
        key: "getClients",
        value: function getClients() {}
    }, {
        key: "flush",
        value: function flush() {}
    }, {
        key: "update",
        value: function update() {}
    }]);

    return Multiplayer;
}(_events2.default);

exports.default = Multiplayer;