"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Renderer = function () {
	function Renderer() {
		_classCallCheck(this, Renderer);
	}

	_createClass(Renderer, [{
		key: "createBlock",
		value: function createBlock(props) {}
	}, {
		key: "init",
		value: function init() {}
	}, {
		key: "destroy",
		value: function destroy() {}
	}, {
		key: "addObject",
		value: function addObject(object) {}
	}, {
		key: "removeObject",
		value: function removeObject(object) {}
	}, {
		key: "raycastObjects",
		value: function raycastObjects(position) {}
	}, {
		key: "getCamera",
		value: function getCamera() {}
	}, {
		key: "setCamera",
		value: function setCamera(camera) {}
	}, {
		key: "createOrbitControls",
		value: function createOrbitControls() {}
	}, {
		key: "getOrbitControls",
		value: function getOrbitControls() {}
	}, {
		key: "destroyOrbitControls",
		value: function destroyOrbitControls() {}
	}, {
		key: "removeAll",
		value: function removeAll() {}
	}, {
		key: "render",
		value: function render() {}
	}]);

	return Renderer;
}();

exports.default = Renderer;