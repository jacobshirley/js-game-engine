"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EventEmitter = typeof window === 'undefined' ? require("events") : window.EventEmitter;

exports.default = EventEmitter;