"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _updateProcessor = require("../base/engine/updates/update-processor.js");

var _updateProcessor2 = _interopRequireDefault(_updateProcessor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PickingPhysicsUpdater = function (_UpdateProcessor) {
    _inherits(PickingPhysicsUpdater, _UpdateProcessor);

    function PickingPhysicsUpdater(pool, physics, timer) {
        _classCallCheck(this, PickingPhysicsUpdater);

        var _this = _possibleConstructorReturn(this, (PickingPhysicsUpdater.__proto__ || Object.getPrototypeOf(PickingPhysicsUpdater)).call(this, pool));

        _this.clientId = -1;
        _this.physics = physics;
        _this.timer = timer;

        _this.handles = [];

        for (var i = 0; i < 100; i++) {
            _this.handles.push(null);
        }return _this;
    }

    _createClass(PickingPhysicsUpdater, [{
        key: "startProcess",
        value: function startProcess(clientId) {
            this.clientId = clientId;
        }
    }, {
        key: "process",
        value: function process(update) {
            if (update.name == "CREATE") {
                var body = this.physics.objects[update.index];
                var pos = update.data;

                this.handles[this.clientId] = this.physics.createJoint({ type: "point2point",
                    body1: body,
                    position: pos });

                console.log(update.name);
                //console.log(update.name+": "+update.frame+", "+this.timer.tick);

                this.physics.addObject(this.handles[this.clientId]);
            } else if (update.name == "MOVE") {
                //console.log(update.name+": "+update.frame+", "+this.timer.tick);
                // console.log("2: "+update.frame);
                var intersection = update.data;
                this.handles[this.clientId].setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
            } else if (update.name == "DESTROY") {
                var handle = this.handles[this.clientId];

                this.physics.removeObject(handle);
                Ammo.destroy(handle);

                this.handles[this.clientId] = null;
            } else if (update.name == "RESET_ALL") {
                this.physics.setAllObjectProps(update.props);
            }
        }
    }]);

    return PickingPhysicsUpdater;
}(_updateProcessor2.default);

exports.default = PickingPhysicsUpdater;