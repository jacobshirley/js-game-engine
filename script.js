function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var server = new Server();
    var client = new WebClient("SDFSDF");
    var networking = new Networking(client, 64);

    //server.addClient(client);

    console.log(client.ws);

    var clock = new THREE.Clock();

    function init() {
        renderer = new Renderer();
        physics = new Physics();

        world = new World(renderer, physics);
        world.init();
        world.picker.enabled = true;
        world.picker.setNetworking(networking);

        //create the lighting
        
        var light = new THREE.DirectionalLight(0xdfebff, 1.75);
        light.position.set(1000, 3000, 1000);
        light.position.multiplyScalar(1.3);

        light.castShadow = true;

        light.shadow.mapSize.width = 512 * 8;
        light.shadow.mapSize.height = 512 * 8;

        var d = 10000;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.far = 10000;

        renderer.createOrbitControls();
        renderer.addObject(light);
        renderer.addObject(new THREE.AmbientLight(0x404040));
    }

    init();

    //server.addObject(new Block(props));

    //code for jenga
    function createAll() {
        var props2 = {size: {width: 5000, height: 500, length: 5000},
                 position: {x: 0, y: -1000, z: 0}, color: 0x00FFFF, mass:0};

        var floor = new Block(props2);
        world.picker.setFloor(floor);
        world.addObject(floor);

        var w = (500/1.5);
        for (var i = 0; i < 1*20; i++) {
            var mod = Math.floor(i/3);
            var height = mod*200;

            var props = {size: {width: 500/3, height: 500, length: 50},
                        color: 0xFFFF00, mass:10};

            if (mod % 2 == 1) {
                props.position = {x: -w+((i%3)*w), y: -500+height, z: w};
                props.rotation = {x: (Math.PI/2), y: 0, z: 0};
            } else {
                props.position = {x: 0, y: -500+height, z: (i%3)*w};
                props.rotation = {x: (Math.PI/2), y: (Math.PI/2), z: 0};
            }
            world.addObject(new Block(props));
            //server.addObject(new Block(props));
        }
    }

    var RADIAN = 2*Math.PI;

    for (var i = 0; i < 30; i++) {
        var props = {size: {width: 500/3, height: 500, length: 50},
                    color: 0xFFFFFF, mass:10};

        props.position = {x: Math.random()*300, y: Math.random()*300, z: Math.random()*300};
        props.rotation = {x: Math.random()*RADIAN, y: Math.random()*RADIAN, z: Math.random()*RADIAN};

        //world.addObject(new Block(props));
    }

    var props = {size: {radius: 200},
                 color: 0xFFFFFF, mass:50};

    props.position = {x: 700, y: 300, z: 300};
    
    //world.addObject(new Ball(props));
    //
    

    function reset(state) {
        world.removeAll(true);
        physics.reset();
        createAll();

        if (state)
            physics.setAllObjectProps(state);
    }

    createAll();

    var FPS = 120;

    function setDebugText(text) {
        $("#debug").text(text);
    }

    setInterval(animate, 1000/FPS);
    
    var DELAY = 100; // in ticks
    var INPUT_DELAY = 15; // in ticks
    var RESET_DELAY = INPUT_DELAY*6; // in ticks

    class PhysicsWorldUpdater extends UpdateProcessor {
        constructor(networking, world) {
            super(networking);
            this.world = world;
            this.physics = this.world.physics;
            this.initUpdate = null;
            this.initialised = false;
        }

        process(update) {
            console.log(update);
            if (update.name == "CONNECTION") {
                var p = this.physics.getAllObjectProps();
                reset(p);

                if (this.networking.isHost) {
                    this.networking.addUpdate({name: "INIT", target: update.id, startFrame: this.networking.tick, props: p});
                }

                return Networking.CONTINUE_DELETE;
            } else if (update.name == "INIT") {
                if (update.target == this.networking.id) {
                    console.log("init");
                    this.initialised = true;

                    this.initUpdate = update;

                    var delay = new Delay(DELAY, true);
                    delay.onFinished = () => {
                        this.networking.tick = this.initUpdate.startFrame;
                        reset(this.initUpdate.props);
                    }
                    this.networking.addDelay(delay);

                    var pickingPhysicsUpdater = new PickingPhysicsUpdater(this.networking, this.physics);
                    var frameUpdater = new FrameUpdater(this.networking, pickingPhysicsUpdater, false);
                    var serverControlUpdater = new FrameUpdater(networking, new ServerControllerUpdater(this.networking, frameUpdater), true);

                    this.networking.addUpdateProcessor(serverControlUpdater);
                }
                return Networking.CONTINUE_DELETE;
            }

            if (!this.initialised)
                return Networking.CONTINUE_DELETE;

            return Networking.SKIP;
        }
    }

    networking.addUpdateProcessor(new PhysicsWorldUpdater(networking, world));

    networking.addInterval(new Interval(INPUT_DELAY, function() {
        networking.sendUpdates();
    }));

    networking.addInterval(new Interval(RESET_DELAY, function() {
        if (networking.isHost) {
            console.log("sending");
            var p = physics.getAllObjectProps();
            networking.addUpdate({frame: networking.tick, name: "RESET_ALL", props: p});
        }
    }));

    function animate() {
        networking.update();
        setDebugText("Tick: "+networking.tick+", updates: ");
        world.update(10);
    }
}

var _trans2 = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

main();