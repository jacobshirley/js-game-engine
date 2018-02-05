"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function currentTime() {
	return Date.now();
}

var Counter = function () {
	function Counter() {
		_classCallCheck(this, Counter);

		this._oldTime = 0;
		this.time = 0;
		this.tick = 0;
		this.deltaTime = 0;
	}

	_createClass(Counter, [{
		key: "update",
		value: function update() {
			this.tick++;

			if (this.tick == 1) {
				this._oldTime = currentTime();
			}

			var curTime = currentTime();
			this.deltaTime = curTime - this._oldTime;
			this._oldTime = curTime;

			this.time += this.deltaTime;
		}
	}]);

	return Counter;
}();

exports.default = Counter;