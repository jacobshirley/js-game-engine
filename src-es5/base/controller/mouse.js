"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MouseController extends _events2.default {
  constructor(id, networked) {
    super();
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.mouseDown = false;
    this.realX = 0;
    this.realY = 0;
    this.realMouseDown = false;
    this.networked = networked;
    this.userData = {};
  }

  init(queue) {
    this.queue = queue;
    $(window).mousedown(event => {
      event.preventDefault();
      this.realX = event.clientX / window.innerWidth * 2 - 1;
      this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
      this.realMouseDown = true;
      this.queue.pushFramed({
        name: "MOUSE_DOWN",
        mouseDown: this.realMouseDown,
        x: this.realX,
        y: this.realY
      }, this.networked);
    });
    $(window).mouseup(event => {
      event.preventDefault();
      this.realX = event.clientX / window.innerWidth * 2 - 1;
      this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
      this.realMouseDown = false;
      this.queue.pushFramed({
        name: "MOUSE_UP",
        mouseDown: this.realMouseDown,
        x: this.realX,
        y: this.realY
      }, this.networked);
    });
    $(window).mousemove(event => {
      event.preventDefault();
      this.realX = event.clientX / window.innerWidth * 2 - 1;
      this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
      this.queue.pushFramed({
        name: "MOUSE_MOVE",
        x: this.realX,
        y: this.realY
      }, this.networked);
    });
    this.queue.addProcessor(this);
  }

  destroy() {
    this.queue.addProcessor(remove);
  }

  process(update) {
    if (update.name == "MOUSE_DOWN") {
      this.x = update.x;
      this.y = update.y;
      this.mouseDown = update.mouseDown;
      this.emit("mousedown", this);
    } else if (update.name == "MOUSE_UP") {
      this.x = update.x;
      this.y = update.y;
      this.mouseDown = update.mouseDown;
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