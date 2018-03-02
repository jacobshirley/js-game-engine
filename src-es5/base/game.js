"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Game {
  constructor(config) {
    this.config = config;
  }

  setEngine(engine) {
    this.engine = engine;
    this.queue = engine.queue;
  }

  get isServer() {
    return this.engine.isServer;
  }

  init() {}

  destroy() {}

  logic() {}

  render() {}

}

exports.default = Game;