"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _delegateUpdater = require("../base/engine/updates/delegate-updater.js");

var _delegateUpdater2 = _interopRequireDefault(_delegateUpdater);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WorldUpdater = function (_DelegateUpdater) {
	_inherits(WorldUpdater, _DelegateUpdater);

	function WorldUpdater(queue, delegate, world) {
		_classCallCheck(this, WorldUpdater);

		var _this = _possibleConstructorReturn(this, (WorldUpdater.__proto__ || Object.getPrototypeOf(WorldUpdater)).call(this, queue, delegate));

		_this.world = world;
		return _this;
	}

	_createClass(WorldUpdater, [{
		key: "setWorld",
		value: function setWorld(world) {
			this.world = world;
		}
	}, {
		key: "process",
		value: function process(update) {
			if (update.name == "INIT") {
				if (!this.pool.isHost) {
					this.world.reset(update.props);
				}
			} else if (update.name == "CONNECTED") {
				if (!this.pool.isHost) {
					this.pool.push({ name: "REQ" });
				}
			} else if (update.name == "REQ") {
				if (this.pool.isHost) {
					var p = this.world.physics.getAllObjectProps();

					this.world.reset(p);
					this.pool.pushFramed({ name: "INIT", props: p });
				}
			}

			return _get(WorldUpdater.prototype.__proto__ || Object.getPrototypeOf(WorldUpdater.prototype), "process", this).call(this, update);
		}
	}]);

	return WorldUpdater;
}(_delegateUpdater2.default);

exports.default = WorldUpdater;