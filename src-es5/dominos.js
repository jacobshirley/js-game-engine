"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _physics = require("./base/engine/world/physics/ammo/physics.js");

var _physics2 = _interopRequireDefault(_physics);

var _block = require("./base/engine/world/objects/block.js");

var _block2 = _interopRequireDefault(_block);

var _pickingPhysicsUpdater = require("./base/engine/world/picker/picking-physics-updater.js");

var _pickingPhysicsUpdater2 = _interopRequireDefault(_pickingPhysicsUpdater);

var _worldUpdater = require("./base/engine/world/world-updater.js");

var _worldUpdater2 = _interopRequireDefault(_worldUpdater);

var _lockstepGame = require("./base/game/lockstep/lockstep-game.js");

var _lockstepGame2 = _interopRequireDefault(_lockstepGame);

var _world = require("./base/engine/world/world.js");

var _world2 = _interopRequireDefault(_world);

var _picker = require("./base/engine/world/picker/picker.js");

var _picker2 = _interopRequireDefault(_picker);

var _mouse = require("./base/controller/mouse.js");

var _mouse2 = _interopRequireDefault(_mouse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BRICKS = 10;

function setDebugText(text) {
  $("#debug").html(text);
}

class Dominos extends _lockstepGame2.default {
  constructor(config) {
    super(config);
    this.renderer = config.renderer;
    this.inited = false;
  }

  initRenderer() {
    //create the lighting
    var light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(10, 30, 10);
    light.position.multiplyScalar(1.3);
    light.castShadow = false;
    light.shadow.mapSize.width = 512 * 4;
    light.shadow.mapSize.height = 512 * 4;
    var d = 15;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 100;
    this.renderer.createOrbitControls();
    this.renderer.addObject(light);
    this.renderer.addObject(new THREE.AmbientLight(0x404040));
  }

  createObjects() {
    var props2 = {
      size: {
        width: 10,
        height: 1,
        length: 10
      },
      position: {
        x: 0,
        y: -1,
        z: 0
      },
      color: 0x00FFFF,
      mass: 0
    };
    var floor = new _block2.default(props2);
    this.world.addObject(floor);
    if (!this.config.headless) this.picker.setFloor(floor);
    var w = 1 / 1.5;

    for (var i = 0; i < 1 * BRICKS; i++) {
      var mod = Math.floor(i / 3);
      var height = mod * 0.30;
      var props = {
        size: {
          width: 1 / 3,
          height: 1,
          length: 0.15
        },
        color: 0x00FF00,
        mass: 1
      };

      if (mod % 2 == 1) {
        props.position = {
          x: -w + i % 3 * w,
          y: 0.15 + height,
          z: w
        };
        props.rotation = {
          x: Math.PI / 2,
          y: 0,
          z: 0
        };
      } else {
        props.position = {
          x: 0,
          y: 0.15 + height,
          z: i % 3 * w
        };
        props.rotation = {
          x: Math.PI / 2,
          y: Math.PI / 2,
          z: 0
        };
      }

      let b = new _block2.default(props);
      this.world.addObject(b);
    }
  }

  getDebugString() {
    return super.getDebugString() + "<br />";
  }

  init() {
    if (!this.config.headless) {
      this.renderer.init();
      this.initRenderer();
    }

    this.physics = new _physics2.default();
    this.physics.init();
    this.world = new _world2.default(this, this.renderer, this.physics);

    if (!this.config.headless) {
      let mouse = new _mouse2.default(0, false);
      this.controllers.add(mouse);
      this.picker = new _picker2.default(this.renderer, this.physics, mouse, this.queue);
    } else {
      this.queue.addProcessor(new _pickingPhysicsUpdater2.default(this.queue, this.physics));
    } //this.queue.addProcessor(new WorldUpdater(this.queue, this.world));


    this.queue.addProcessor(this);

    if (this.isServer) {
      this.createObjects();
    }
  }

  process(update) {
    if (update.name == "CREATE_WORLD") {
      if (!this.isServer && !this.inited) {
        this.inited = true;
        this.createObjects();
      }

      console.log("reset");
      this.world.reset(update.props);
    } else if (update.name == "INIT" || update.name == "RESET_CLOCK") {
      if (!this.queue.isHost) {
        console.log("clock reset");
        this.multiplayer.clear();
        this.queue.push({
          name: "INIT_WORLD"
        }, true);
      }
    } else if (update.name == "INIT_WORLD") {
      if (this.queue.isHost) {
        let props = this.world.physics.getAllObjectProps();
        this.queue.pushFramed({
          name: "CREATE_WORLD",
          props
        }, true);
      }
    }
  }

  logic(frame) {
    if (!this.config.headless) this.picker.update(frame);
    this.world.update(frame);
  }

  render() {
    this.world.render();
    setDebugText(this.getDebugString());
  }

}

exports.default = Dominos;