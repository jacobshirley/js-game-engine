"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controllers = function () {
    function Controllers(queue) {
        _classCallCheck(this, Controllers);

        this.queue = queue;
        this.cont = [];
    }

    _createClass(Controllers, [{
        key: "add",
        value: function add(controller) {
            controller.init(this.queue);

            this.cont.push(controller);
        }
    }, {
        key: "remove",
        value: function remove(controller) {
            //to do
        }
    }]);

    return Controllers;
}();

exports.default = Controllers;