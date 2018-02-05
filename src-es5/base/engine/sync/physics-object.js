"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PhysicsSynchronizer = function () {
    function PhysicsSynchronizer(object, physics) {
        _classCallCheck(this, PhysicsSynchronizer);

        this.object = object;
        this.physics = physics;
    }

    _createClass(PhysicsSynchronizer, [{
        key: "init",
        value: function init(data) {
            if (data) {
                this.object.props = data.props;
                this.physics.setObjectProps(this.object.physicsData.body, data.physics);
            } else return { props: this.object.props, physics: this.physics.getObjectProps(this.object.physicsData.body) };
        }
    }, {
        key: "sync",
        value: function sync() {
            return null;
        }
    }, {
        key: "destroy",
        value: function destroy() {}
    }]);

    return PhysicsSynchronizer;
}();

exports.default = PhysicsSynchronizer;