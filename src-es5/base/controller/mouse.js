"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window !== 'undefined') {
  var listeners = [];
  $(window).mousedown(event => {
    event.preventDefault();

    for (let l of listeners) l.mousedown(event);
  });
  $(window).mouseup(event => {
    event.preventDefault();

    for (let l of listeners) l.mouseup(event);
  });
  $(window).mousemove(event => {
    event.preventDefault();

    for (let l of listeners) l.mousemove(event);
  });
}

class MouseController extends _events2.default {
  constructor(id, networked) {
    super();
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.mouseDown = false;
    this.button = 0;
    this.realX = 0;
    this.realY = 0;
    this.realMouseDown = false;
    this.realButton = 0;
    this.networked = networked;
    this.userData = {};
  }

  mousedown(event) {
    this.realX = event.clientX / window.innerWidth * 2 - 1;
    this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
    this.realMouseDown = true;
    this.realButton = event.button;
    this.queue.pushFramed({
      name: "MOUSE_DOWN",
      mouseDown: this.realMouseDown,
      x: this.realX,
      y: this.realY,
      button: this.realButton
    }, this.networked);
  }

  mouseup(event) {
    this.realX = event.clientX / window.innerWidth * 2 - 1;
    this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
    this.realMouseDown = false;
    this.realButton = event.button;
    this.queue.pushFramed({
      name: "MOUSE_UP",
      mouseDown: this.realMouseDown,
      x: this.realX,
      y: this.realY,
      button: this.realButton
    }, this.networked);
  }

  mousemove(event) {
    this.realX = event.clientX / window.innerWidth * 2 - 1;
    this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
    this.queue.pushFramed({
      name: "MOUSE_MOVE",
      x: this.realX,
      y: this.realY
    }, this.networked);
  }

  init(queue) {
    this.queue = queue;
    listeners.push(this);
    this.queue.addProcessor(this);
  }

  destroy() {
    this.queue.removeProcessor(this);
    listeners.splice(listeners.indexOf(this), 1);
  }

  process(update) {
    if (update.name == "MOUSE_DOWN") {
      this.x = update.x;
      this.y = update.y;
      this.mouseDown = update.mouseDown;
      this.button = update.button;
      this.emit("mousedown", this);
    } else if (update.name == "MOUSE_UP") {
      this.x = update.x;
      this.y = update.y;
      this.mouseDown = update.mouseDown;
      this.button = update.button;
      this.emit("mouseup", this);
    } else if (update.name == "MOUSE_MOVE") {
      this.x = update.x;
      this.y = update.y;
      this.updates++;
      this.emit("mousemove", this);
    }
  }

}

exports.default = MouseController;