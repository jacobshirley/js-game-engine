"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasicIterator = function () {
	function BasicIterator(data, copy) {
		_classCallCheck(this, BasicIterator);

		this.data = data;
		this.index = 0;
		//copy = copy || true;
		if (copy) this.data = [].concat(data);
	}

	_createClass(BasicIterator, [{
		key: "hasNext",
		value: function hasNext() {
			return this.index < this.data.length;
		}
	}, {
		key: "next",
		value: function next() {
			return this.data[this.index++];
		}
	}, {
		key: "remove",
		value: function remove() {
			this.index--;
			if (this.index <= 0) {
				this.index = 0;
				return this.data.shift();
			}
			return this.data.splice(this.index, 1);
		}
	}]);

	return BasicIterator;
}();

exports.default = BasicIterator;