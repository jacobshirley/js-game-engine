"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _stream = require("../../engine/updates/streamed/stream.js");

var _stream2 = _interopRequireDefault(_stream);

var _streamUpdateQueue = require("../../engine/updates/streamed/stream-update-queue.js");

var _streamUpdateQueue2 = _interopRequireDefault(_streamUpdateQueue);

var _lockstepQueueError = require("./lockstep-queue-error.js");

var _lockstepQueueError2 = _interopRequireDefault(_lockstepQueueError);

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LATENCY = 20;

var LockstepUpdateQueue = function (_StreamUpdateQueue) {
	_inherits(LockstepUpdateQueue, _StreamUpdateQueue);

	function LockstepUpdateQueue(local, clients) {
		_classCallCheck(this, LockstepUpdateQueue);

		var _this = _possibleConstructorReturn(this, (LockstepUpdateQueue.__proto__ || Object.getPrototypeOf(LockstepUpdateQueue)).call(this, local, clients));

		_this.updates = [];
		_this.controlServerID = -1;
		return _this;
	}

	_createClass(LockstepUpdateQueue, [{
		key: "setControlServer",
		value: function setControlServer(id) {
			this.controlServerID = id;
		}
	}, {
		key: "queueLocalUpdates",
		value: function queueLocalUpdates() {
			this.updates = this.updates.concat(this.local.localUpdates.splice(0));
		}
	}, {
		key: "queueUpdates",
		value: function queueUpdates(frame) {
			var applied = [];

			//process host first

			var stream = this.clients.host();
			var it = stream.iterator();

			while (it.hasNext()) {
				var u = it.next();

				u.__clId = stream.id();
				if (u.frame == frame) {

					it.remove();

					if (u.name == "APPLY") {
						var data = u.updateMeta;
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var d = _step.value;

								var cl = this.clients.get(d.id);

								cl.toBeRead = d.count;
								//console.log(u);
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

					this.updates.push(u);
				} else if (u.frame < frame) {
					//console.log("frame behind: "+u.frame+" < "+frame+": "+u.name);
					it.remove();
				} else if (!u.frame) {
					it.remove();

					/*if (!this.isHost && u.name == "HOST_TICK") {
     	let diff = u.tick - frame;
     	if (diff < LATENCY) {
     		console.log(u);
     		console.log(diff+", "+u.tick+", "+frame);
     		//this.updates.push(u);
     		console.log("LATENCY ERROR");
     		throw new LockstepQueueError(diff);
     	} else {
     		//this.updates.push(u);
     	}
     }*/

					this.updates.push(u);
				}
			}

			//every other stream
			var clients = this.clients.iterator();

			while (clients.hasNext()) {
				stream = clients.remove();

				if (!stream.host()) {
					var _it = stream.iterator();

					if (this.isHost) {
						var i = 0;
						var updated = _it.hasNext();

						while (_it.hasNext()) {
							var _u = _it.remove();
							_u.__clId = stream.id();
							this.updates.push(_u);
							i++;
						}

						if (updated) {
							//console.log("applied "+i+ " on frame "+frame);

							applied.push({ id: stream.id(), count: i });
						}
					} else {
						if (stream.toBeRead > 0) {
							//console.log("applied "+stream.toBeRead+" on frame "+frame);
							while (stream.toBeRead-- > 0 && _it.hasNext()) {
								var _u2 = _it.remove();
								_u2.__clId = stream.id();

								this.updates.push(_u2);
							}

							if (stream.toBeRead > 0) {
								console.log("stream need to read " + stream.toBeRead);
								//console.log(stream);
								throw new _lockstepQueueError2.default(-1);
							}
						}
					}
				}
			}

			if (this.isHost && applied.length > 0) {
				this.local.push({ name: "APPLY", frame: frame, updateMeta: applied }, true);
			}
		}
	}, {
		key: "handleUpdates",
		value: function handleUpdates(frame) {
			while (this.updates.length > 0) {
				var u = this.updates.shift();

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.processors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var processor = _step2.value;

						processor.process(u);
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				this.processedUpdates++;
			}
		}
	}, {
		key: "update",
		value: function update(frame) {
			_get(LockstepUpdateQueue.prototype.__proto__ || Object.getPrototypeOf(LockstepUpdateQueue.prototype), "update", this).call(this);

			this.queueLocalUpdates(frame);
			this.queueUpdates(frame);
			this.handleUpdates(frame);
		}
	}]);

	return LockstepUpdateQueue;
}(_streamUpdateQueue2.default);

exports.default = LockstepUpdateQueue;