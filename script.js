function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var server = new Server();
    var client = new WebClient("SDFSDF");
    var networking = new Networking(client, physics, 64);

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
    var otherHandle = null;
    var time = new Date().getTime();
    var curUpdate = 0;
    var upd = 0;
    var DELAY = 300;
    var delay = 0;
    var delayTick = 0;
    var latency = 150;
    var maxUpdatesBeforeReset = 10;
    var queued = [];
    var updates = [];
    var updatesDone = 0;
    var lastTime = time;
    var done = false;
    var curReset = 0;

    var FPS = 120;
    var started = false;

    /*client.onMessages.push(function(data) {
        if (typeof data.isHost != 'undefined') {
            initialised = data.isHost;
            if (!data.isHost) {
                console.log("ADDING CONNECTION");
                client.updates.push({name: "CONNECTION", id: client.id});
            }
        }
    });*/

    function reset(state) {
        world.removeAll(true);
        physics.reset();
        createAll();

        if (state)
            physics.setAllObjectProps(state);
    }

    //reset();

    createAll();

    var props = null;
    var resetFrame = -1;

    var frameBuffer = [];

    function setDebugText(text) {
        $("#debug").text(text);
    }

    setInterval(animate, 1000/FPS);

    var shown = false;
    var initialised = false;

    function doUpdate(update) {
        console.log(update);
        if (update.name == "CREATE") {
            var body = physics.objects[update.index];
            var pos = update.data;

            otherHandle = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(pos.x, pos.y, pos.z));
            physics.dynamicsWorld.addConstraint(otherHandle);
        } else if (update.name == "MOVE") {
            var intersection = update.data;
            otherHandle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
        } else if (update.name == "DESTROY") {
            physics.dynamicsWorld.removeConstraint(otherHandle);
            Ammo.destroy(otherHandle);

            otherHandle = null;
        } else if (update.name == "RESET_ALL") {
            physics.setAllObjectProps(update.props);
        }

        return Networking.CONTINUE_DELETE;
    }

    var processedUpdates = 0;
    var startedApplying = [];

    var startedUpdates = [];
    var toBeFinished = [];

    var initUpdate = null;
    var initialised = false;

    networking.addUpdateProcessor({process: function (update) {
        if (update.name == "CONNECTION") {
            var p = physics.getAllObjectProps();
            reset(p);

            if (networking.isHost) {
                console.log("SENDING");
                networking.addUpdate({name: "INIT", target: update.id, startFrame: networking.tick, props: p});
            }

            return Networking.CONTINUE_DELETE;
        } else if (update.name == "INIT") {
            if (update.target == networking.id) {
                initialised = true;

                //networking.tick = update.startFrame;
                initUpdate = update;
                //networking.tick = initUpdate.startFrame;
                //reset(initUpdate.props);

                var delay2 = new NetworkDelay(DELAY, true);
                delay2.onFinished = function() {
                    networking.tick = initUpdate.startFrame;
                    reset(initUpdate.props);
                }
                networking.addDelay(delay2);
            }
            return Networking.CONTINUE_DELETE;
        }
        //if (!initialised)
            //return Networking.CONTINUE_DELETE;

        return Networking.SKIP;
    }});

    class PhysicsUpdater extends UpdateProcessor {
        constructor(networking) {
            super(networking);
        }

        process(update) {
            return doUpdate(update);
        }
    }

    var physicsUpdater = new PhysicsUpdater(networking);
    var frameUpdater = new FrameUpdater(networking, physicsUpdater, false);
    var serverControlUpdater = new FrameUpdater(networking, new ServerControllerUpdater(networking, frameUpdater), true);

    //networking.addUpdateProcessor(frameUpdater);
    networking.addUpdateProcessor(serverControlUpdater);

    function animate() {
        var curTime = new Date().getTime();

        delay = 0;

        client.tick++;

        networking.update();

        if (curTime - time >= latency) {
            time = curTime;

            if (networking.isHost) {
                curReset++;
                if (curReset == maxUpdatesBeforeReset) {
                    curReset = 0;
                    var p = physics.getAllObjectProps();
                    //networking.addUpdate({frame: networking.tick, name: "RESET_ALL", props: p});
                }
            }

            //networking.addUpdate({frame: networking.tick, name: "RESET_ALL", props: p});
            client.sendUpdates();
        }

        setDebugText("Tick: "+networking.tick+", updates: "+processedUpdates);

        world.update(10);


        /*client.recv();
        updates = client.receivedUpdates;

        setDebugText("Tick: "+client.tick+", updates: "+processedUpdates);

        var appliedUpdates = [];
        var stoppedUpdates = [];

        for (var i = 0; i < updates.length; i++) {
            var id = updates[i].id;
            var updateCache = updates[i].updates;

            var index = -1;
            for (var j = 0; j < startedApplying.length; j++) {
                if (startedApplying[j] == id) {
                    index = j;
                    break;
                }
            }

            if (updateCache.length > 0) {
                var update = updateCache[0];
                while (!update.frame && updateCache.length > 0) {
                    update = updateCache[0];
                    if (update.name == "CONNECTION") {
                        var p = physics.getAllObjectProps();
                        reset(p);
                        if (client.isHost) {
                            client.updates.push({name: "INIT", target: update.id, startFrame: client.tick, props: p});
                        }
                    } else if (update.name == "INIT") {
                        if (update.target == client.id) {
                            initialised = true;

                            reset(update.props);
                            client.tick = update.startFrame;
                            delay = DELAY;
                        }
                    }
                    updateCache.shift();
                }

                if (initialised && updateCache.length > 0) {
                    update = updateCache[0];
                    if (client.id != id) {
                        while (client.tick == update.frame) {
                            if (update.name == "RESET_ALL") {
                                //physics.setAllObjectProps(update.props);
                            } else if (update.name == "APPLY") {
                                var applied = update.updateMeta;
                                for (var j = 0; j < applied.length; j++) {
                                    var apply = applied[j];
                                    startedUpdates.push(apply);
                                }
                            } else if (update.name == "STOP_APPLYING") {
                                var applied = update.updateMeta;
                                toBeFinished = applied;
                                while (toBeFinished.length > 0) {
                                    var test = toBeFinished.shift();
                                    for (var j = 0; j < startedUpdates.length; j++) {
                                        if (test == startedUpdates[j]) {
                                            startedUpdates.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                            } else {
                                doUpdate(update);
                            }
                            updateCache.shift();
                            if (updateCache.length == 0)
                                break;

                            update = updateCache[0];
                            //processedUpdates++;
                        }
                    }

                    if (id != client.id && client.isHost && update.frame < client.tick) {
                        var tempTick = update.frame;
                        var started = update.frame == tempTick;
                        if (started) {
                            if (index == -1) {
                                startedApplying.push(id);
                                appliedUpdates.push(id);
                            }
                        }
                        while (update.frame == tempTick) {
                            processedUpdates++;
                            //console.log(JSON.stringify(update)+"   : "+processedUpdates+", client tick "+client.tick);
                            doUpdate(update);

                            updateCache.shift();
                            if (updateCache.length == 0)
                                break;

                            update = updateCache[0];
                        }
                    }
                }
            } else {
                if (index != -1) {
                    //console.log("stopped2");
                    stoppedUpdates.push(id);
                    startedApplying.splice(index, 1);
                }
            }
        }

        if (!client.isHost) {         
            var found = false;
            for (var k = 0; k < startedUpdates.length; k++) {
                var id = startedUpdates[k];
                var updateCache = updates[id].updates;
                if (updateCache.length > 0) {
                    var update = updateCache[0];

                    var tempTick = update.frame;
                    var started = update.frame == tempTick;
                    while (update.frame == tempTick) {
                        processedUpdates++;
                        //console.log(JSON.stringify(update)+"   : "+processedUpdates+", client tick "+client.tick);
                        doUpdate(update);

                        updateCache.shift();
                        if (updateCache.length == 0)
                            break;

                        update = updateCache[0];
                    }
                }
            }
        }

        if (appliedUpdates.length > 0)
            client.updates.push({name: "APPLY", frame: client.tick, updateMeta: appliedUpdates});

        if (stoppedUpdates.length > 0)
            client.updates.push({name: "STOP_APPLYING", frame: client.tick, updateMeta: stoppedUpdates});*/

        /*if (!client.isHost) {         
            var found = false;
            for (var k = 0; k < startedUpdates.length; k++) {
                var id = startedUpdates[k];
            }
        }*/

        lastTime = curTime;

        //requestAnimationFrame(animate);
    }
}

var _trans2 = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

main();