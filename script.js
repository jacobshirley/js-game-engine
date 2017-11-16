import {TestConnection, WebSocketConnection} from "./src/net/networking.js";
import Renderer from "./src/three/renderer.js";
import Physics from "./src/ammo/physics.js";
import Block from "./src/objects/block.js";
import LockstepUpdateQueue from "./src/updates/lockstep-update-queue.js";
import LockstepTimer from "./src/timing/lockstep-timer.js";
import PickingPhysicsUpdater from "./src/updates/updaters/picking-physics-updater.js";
import Controllers from "./src/controller/controller.js";
import World from "./src/world.js";
import WorldUpdater from "./src/updates/updaters/world-updater.js";
import Interval from "./src/timing/interval.js";

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

const BRICKS = 10;

function main() {
    var renderer, physics, controllers, world;
    var connection = new TestConnection(50, 0);
    //connection = new WebSocketConnection("ws://127.0.0.1:8080/");

    renderer = new Renderer();
    physics = new Physics();

    var updatePool = new LockstepUpdateQueue(connection);
    var timer = new LockstepTimer(updatePool, 5);
    let physicsUpdater = new PickingPhysicsUpdater(updatePool, physics);
    //var serverHandler = new ServerConnection(connection, updatePool, physicsUpdater);

    //updatePool.addStream(myClient);

    controllers = new Controllers(timer, updatePool);

    world = new World(timer, renderer, physics, updatePool, controllers);
    world.init();
    world.picker.enabled = true;

    updatePool.addProcessor(timer);
    updatePool.addProcessor(new WorldUpdater(updatePool, physicsUpdater, world));

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

    renderer.createOrbitControls();
    renderer.addObject(light);
    renderer.addObject(new THREE.AmbientLight(0x404040));

    //server.addObject(new Block(props));

    //code for jenga
    function createAll() {
        var props2 = {size: {width: 10, height: 1, length: 10},
                      position: {x: 0, y: -1, z: 0},
                      color: 0x00FFFF,
                      mass:0};

        var floor = new Block(props2);
        world.picker.setFloor(floor);
        world.addObject(floor);

        var w = (1/1.5);
        for (var i = 0; i < 1*BRICKS; i++) {
            var mod = Math.floor(i/3);
            var height = mod*(0.30);

            var props = {size: {width: 1/3, height: 1, length: 0.15},
                        color: 0xFFFF00, mass:1};

            if (mod % 2 == 1) {
                props.position = {x: -w+((i%3)*w), y: 0.15+height, z: w};
                props.rotation = {x: (Math.PI/2), y: 0, z: 0};
            } else {
                props.position = {x: 0, y: 0.15+height, z: (i%3)*w};
                props.rotation = {x: (Math.PI/2), y: (Math.PI/2), z: 0};
            }

            world.addObject(new Block(props));
        }

        /*var RADIAN = 2*Math.PI;

        //for (var i = 0; i < 30; i++) {
            var props = {radius: 1,
                        color: 0xFFFFFF, mass:10};

            props.position = {x: Math.random()*1, y: Math.random()*1, z: Math.random()*1};
            props.rotation = {x: Math.random()*RADIAN, y: Math.random()*RADIAN, z: Math.random()*RADIAN};

            world.addObject(new Ball(props));
        //}*/
    }

    createAll();

    function setDebugText(text) {
        $("#debug").html(text);
    }

    var DELAY = 200;
    var INPUT_DELAY = 2; // in ticks
    var RESET_DELAY = 5000; // in ms

    let sendInterval = new Interval(INPUT_DELAY, true);
    sendInterval.on('complete', () => {
        updatePool.flush();
    });

    world.addInterval(sendInterval);

    function animate() {
        world.render();

        setDebugText(world.getDebugString());

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

main();
