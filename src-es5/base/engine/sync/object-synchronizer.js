"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectSynchronizer = function () {
    function ObjectSynchronizer(updateQueue) {
        _classCallCheck(this, ObjectSynchronizer);

        this.updateQueue = updateQueue;
        this.tracked = [];
    }

    _createClass(ObjectSynchronizer, [{
        key: "sync",
        value: function sync(object) {
            var syncer = object.synchronizer();
            var initData = syncer.init();

            this.tracked.push(syncer);

            this.updateQueue.pushFramed({ name: "SYNC_INIT", i: this.tracked.length - 1, data: initData });
        }
    }, {
        key: "update",
        value: function update() {
            if (!this.updateQueue.isHost) return;

            var c = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.tracked[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var trackedObj = _step.value;

                    var syncData = trackedObj.sync();
                    if (syncData) {
                        this.updateQueue.pushFramed({ name: "SYNC_OBJ", i: c++, data: syncData });
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: "process",
        value: function process(update) {
            if (this.updateQueue.isHost) return;

            if (update.name == "SYNC_INIT") {
                var syncer = this.tracked[update.i];
                syncer.init(update.data);
            } else if (update.name == "SYNC_OBJ") {
                var _syncer = this.tracked[update.i];
                _syncer.sync(update.data);
            }
        }
    }]);

    return ObjectSynchronizer;
}();

exports.default = ObjectSynchronizer;