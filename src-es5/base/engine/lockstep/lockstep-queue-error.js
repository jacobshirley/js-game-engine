"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class LockstepQueueError extends Error {
  constructor(delay, ...params) {
    super(...params);
    this.delay = delay;
    this.message = "Lockstep needs to delay execution";
  }

}

exports.default = LockstepQueueError;