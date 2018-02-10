import Physics from "./base/engine/physics/ammo/physics.js";
import Block from "./base/engine/objects/block.js";

import PickingPhysicsUpdater from "./updaters/picking-physics-updater.js";
import WorldUpdater from "./updaters/world-updater.js";

import ObjectSynchronizer from "./base/engine/sync/object-synchronizer.js";
import LockstepGame from "./base/game/lockstep/lockstep-game.js";

import World from "./base/engine/world.js";
import Picker from "./base/engine/picker.js";

import MouseController from "./base/controller/mouse.js";

const BRICKS = 10;

function setDebugText(text) {
    $("#debug").html(text);
}

export default class Dominos extends LockstepGame {
    constructor(config) {
        super(config);

        this.renderer = config.renderer;
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
        var props2 = {size: {width: 10, height: 1, length: 10},
                      position: {x: 0, y: -1, z: 0},
                      color: 0x00FFFF,
                      mass: 0};

        var floor = new Block(props2);
        this.world.addObject(floor);

        if (!this.config.headless)
            this.picker.setFloor(floor);

        var w = 1 / 1.5;
        for (var i = 0; i < 1 * BRICKS; i++) {
            var mod = Math.floor(i / 3);
            var height = mod * 0.30;

            var props = {size: {width: 1 / 3, height: 1, length: 0.15},
                        color: 0xFFFF00, mass:1};

            if (mod % 2 == 1) {
                props.position = {x: -w + ((i % 3) * w), y: 0.15 + height, z: w};
                props.rotation = {x: (Math.PI / 2), y: 0, z: 0};
            } else {
                props.position = {x: 0, y: 0.15 + height, z: (i % 3) * w};
                props.rotation = {x: (Math.PI / 2), y: (Math.PI / 2), z: 0};
            }

            let b = new Block(props);
            this.world.addObject(b);
        }
    }

    getDebugString() {
        return super.getDebugString() + "<br />" +
               "Picker updates: " + this.ph.us;
    }

    init() {
        if (!this.config.headless) {
            this.renderer.init();
            this.initRenderer();
        }

        this.physics = new Physics();
        this.physics.init();

        this.world = new World(this, this.renderer, this.physics);

        if (!this.config.headless) {
            let mouse = new MouseController(0, false);
            this.controllers.add(mouse);
            this.picker = new Picker(this.renderer, this.physics, mouse, this.multiplayer.getLocalClient());
        }

        let physicsUpdater = new PickingPhysicsUpdater(this.queue, this.physics);
        this.queue.addProcessor(new WorldUpdater(this.queue, physicsUpdater, this.world));

        this.ph = physicsUpdater;

        this.createObjects();
    }

    logic(frame) {
        if (!this.config.headless)
            this.picker.update(frame);

        this.world.logic(frame);
    }

    render() {
        this.world.render();

        setDebugText(this.getDebugString());
    }
}
