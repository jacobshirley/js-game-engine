"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateProcessor = require("../updates/update-processor.js");

var _updateProcessor2 = _interopRequireDefault(_updateProcessor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WorldUpdater extends _updateProcessor2.default {
  constructor(queue, world) {
    super(queue);
    this.world = world;
  }

  process(update) {
    if (update.name == "CREATE_WORLD") {
      this.world.reset(update.props);
    } else if (update.name == "INIT") {
      if (!this.pool.isHost) {
        this.pool.push({
          name: "INIT_WORLD"
        }, true);
      }
    } else if (update.name == "INIT_WORLD") {
      if (this.pool.isHost) {
        let props = this.world.physics.getAllObjectProps();
        this.pool.pushFramed({
          name: "CREATE_WORLD",
          props
        }, true);
      }
    }
  }

}

exports.default = WorldUpdater;