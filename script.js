function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var client = new WebSocketConnection("ws://127.0.0.1:8080/");
    var networking = new Networking(client, 64);

    function init() {
        renderer = new Renderer();
        physics = new Physics();

        world = new World(renderer, physics, networking);
        world.init();
        world.picker.enabled = true;
        world.picker.setNetworking(networking);

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
    }

    init();

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
            var height = mod*1;

            var props = {size: {width: 1/3, height: 1, length: 0.15},
                        color: 0xFFFF00, mass:1};

            if (mod % 2 == 1) {
                props.position = {x: -w+((i%3)*w), y: -1+height, z: w};
                props.rotation = {x: (Math.PI/2), y: 0, z: 0};
            } else {
                props.position = {x: 0, y: -1+height, z: (i%3)*w};
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
        $("#debug").text(text);
    }
    
    var DELAY = 200;
    var INPUT_DELAY = 5; // in ticks
    var RESET_DELAY = 5000; // in ms

    let sendInterval = new Interval(INPUT_DELAY, true);
    sendInterval.on('complete', () => {
        if (networking.isHost) {
            networking.addUpdate({name: "SERVER_TICK", time: Timer.currentTime, tick: networking.tick});
        }
        networking.sendUpdates();
    });

    let resetInterval = new Interval(RESET_DELAY, false);
    resetInterval.on('complete', () => {
        if (networking.isHost) {
            networking.addUpdate({name: "RESET_ALL", frame: networking.tick, props: physics.getAllObjectProps()});
        }
    });

    networking.addInterval(sendInterval);
    networking.addInterval(resetInterval);

    networking.addUpdateProcessor(new PhysicsWorldUpdater(networking, world, DELAY));

    world.setMaxFrames(33);
    world.setUpdateRate(100);

    function animate() {
        //if (networking.update()) {
            //if (networking.isHost)
        setDebugText(world.getDebugString());
        world.update();
        //}

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

main();