function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var connection = new WebSocketConnection("ws://192.168.1.77:8080/");
    //var p2pNetworking = new Networking(connection, 64);

    renderer = new Renderer();
    physics = new Physics();

    var updatePool = new LockstepUpdateQueue(connection);

    let physicsUpdater = new PickingPhysicsUpdater(updatePool, physics);
    //var serverHandler = new ServerConnection(connection, updatePool, physicsUpdater);


    var myClient = updatePool.myClient;
    //updatePool.addStream(myClient);

    world = new World(renderer, physics, updatePool);
    world.init();
    world.picker.enabled = true;
    world.picker.setLocalUpdateStream(myClient);

    updatePool.addProcessor(new WorldUpdater(updatePool, physicsUpdater, world));

    //create the lighting

    var light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(10, 30, 10);
    light.position.multiplyScalar(1.3);

    //light.castShadow = true;

    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;

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
        for (var i = 0; i < 1*10; i++) {
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

        for (var i = 0; i < 30; i++) {
            var props = {size: {width: 500/3, height: 500, length: 50},
                        color: 0xFFFFFF, mass:10};

            props.position = {x: Math.random()*300, y: Math.random()*300, z: Math.random()*300};
            props.rotation = {x: Math.random()*RADIAN, y: Math.random()*RADIAN, z: Math.random()*RADIAN};

            world.addObject(new Block(props));
        }*/
    }

    createAll();

    function setDebugText(text) {
        $("#debug").html(text);
    }

    var DELAY = 200;
    var INPUT_DELAY = 5; // in ticks
    var RESET_DELAY = 5000; // in ms

    let sendInterval = new Interval(INPUT_DELAY, true);
    sendInterval.on('complete', () => {
        if (updatePool.isHost) {
            updatePool.push({name: "SERVER_TICK", time: world.updateTimer.time, tick: world.updateTimer.tick});
        }
        updatePool.flush();
    });

    let resetInterval = new Interval(RESET_DELAY, false);
    resetInterval.on('complete', () => {
        //if (p2pNetworking.isHost) {
            //p2pNetworking.addUpdate({name: "RESET_ALL", frame: p2pNetworking.tick, props: physics.getAllObjectProps()});
        //}
    });

    world.addInterval(sendInterval);
    world.addInterval(resetInterval);

    //updatePool.addProcessor(new LockstepUpdater(updatePool));//new PhysicsWorldUpdater(updatePool, myClient, world, DELAY));
    //world.setMaxFrames(60);
    //world.setUpdateRate(30);

    function animate() {
        world.update();

        setDebugText(world.getDebugString());

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

main();
