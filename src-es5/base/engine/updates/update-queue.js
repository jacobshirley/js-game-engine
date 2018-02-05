"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UpdateQueue = function () {
	function UpdateQueue() {
		_classCallCheck(this, UpdateQueue);

		this.processors = [];

		this.processedUpdates = 0;
	}

	_createClass(UpdateQueue, [{
		key: "addProcessor",
		value: function addProcessor(processor) {
			this.processors.push(processor);
		}
	}, {
		key: "removeProcessor",
		value: function removeProcessor(processor) {
			this.processors.splice(this.processors.indexOf(processor), 1);
		}
	}, {
		key: "push",
		value: function push(update) {}
	}, {
		key: "pushFramed",
		value: function pushFramed(update) {}
	}, {
		key: "update",
		value: function update(frame) {}
	}]);

	return UpdateQueue;
}();

exports.default = UpdateQueue;

var BasicUpdateQueue = exports.BasicUpdateQueue = function (_UpdateQueue) {
	_inherits(BasicUpdateQueue, _UpdateQueue);

	function BasicUpdateQueue() {
		_classCallCheck(this, BasicUpdateQueue);

		var _this = _possibleConstructorReturn(this, (BasicUpdateQueue.__proto__ || Object.getPrototypeOf(BasicUpdateQueue)).call(this));

		_this.updates = [];
		_this.toBeFramed = [];
		return _this;
	}

	_createClass(BasicUpdateQueue, [{
		key: "push",
		value: function push(update) {
			this.updates.push(update);
		}
	}, {
		key: "pushFramed",
		value: function pushFramed(update) {
			this.toBeFramed.push(update);
		}
	}, {
		key: "update",
		value: function update(frame) {
			var it = new BasicIterator(this.toBeFramed, false);
			while (it.hasNext()) {
				var u = it.remove();
				u.frame = frame;
				this.updates.push(u);
			}

			it = new BasicIterator(this.updates, false);
			while (it.hasNext()) {
				var _u = it.remove();

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.processors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var p = _step.value;

						p.process(_u);
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

				this.processedUpdates++;
			}
		}
	}]);

	return BasicUpdateQueue;
}(UpdateQueue);