"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _physicsObject = require("../sync/physics-object.js");

var _physicsObject2 = _interopRequireDefault(_physicsObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Block = function () {
    function Block(props) {
        _classCallCheck(this, Block);

        this.props = props;
    }

    _createClass(Block, [{
        key: "init",
        value: function init(physics) {
            var body = physics.createBlock(this.props);

            this.physicsData = {
                body: body
            };

            this.syncer = new _physicsObject2.default(this, physics);
        }
    }, {
        key: "initRenderer",
        value: function initRenderer(renderer) {
            //3d rendering

            var mesh = renderer.createBlock(this.props);

            if (mesh) {
                mesh.userData.body = this.physicsData.body;
                mesh.userData.static = this.props.mass == 0;
            }

            this.renderData = {
                mesh: mesh
            };
        }
    }, {
        key: "synchronizer",
        value: function synchronizer() {
            return this.syncer;
        }
    }, {
        key: "copy",
        value: function copy() {
            return new Block(this.props);
        }
    }]);

    return Block;
}();

exports.default = Block;