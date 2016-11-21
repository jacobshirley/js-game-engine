function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var server = new Server();
    var client = new WebClient("SDFSDF");

    //server.addClient(client);

    console.log(client.ws);

    var clock = new THREE.Clock();

    function init() {
        renderer = new Renderer();
        physics = new Physics();

        world = new World(renderer, physics);
        world.init();
        world.picker.enabled = true;
        world.picker.setClient(client);

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
    var DELAY = 200;
    var delay = 0;
    var delayTick = 0;
    var latency = 400;
    var maxUpdatesBeforeReset = 10;
    var queued = [];
    var updates = [];
    var updatesDone = 0;
    var lastTime = time;
    var done = false;
    var curReset = 0;

    var FPS = 120;
    var started = false;

    client.onMessages.push(function(data) {
        if (typeof data.isHost != 'undefined') {
            initialised = data.isHost;
            if (!data.isHost) {
                console.log("ADDING CONNECTION");
                client.updates.push({name: "CONNECTION", id: client.id});
            }
        }
    });

    function reset(state) {
        world.removeAll(true);
        physics.destroy();
        physics.init();
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

    function animate() {
        var curTime = new Date().getTime();

        if (delay > 0) {
            delayTick++;
        }

        if (!done && delayTick < delay) {
            console.log("STILL DELAYED");
            setDebugText("DELAYED");
            return;
        }

        if (delay > 0) {
            done = true;
        }

        delay = 0;

        client.tick++;

        if (curTime - time >= latency) {
            time = curTime;

            if (client.isHost) {
                curReset++;
                if (curReset == maxUpdatesBeforeReset) {
                    curReset = 0;
                    var p = physics.getAllObjectProps();
                    client.updates.push({frame: client.tick, name: "RESET_ALL", props: p});
                }
            }

            client.sendUpdates();
        }

        client.recv();
        updates = client.receivedUpdates;

        setDebugText("Tick: "+client.tick);

        var phys = physics;

        if (curUpdate < updates.length) {
            var update = updates[curUpdate];
            //console.log(updates.length);
            while (curUpdate < updates.length && !update.frame) {
                update = updates[curUpdate];
                if (update.name == "CONNECTION") {
                    //console.log("GOT CONNECTION");
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
                curUpdate++;
            }
            if (curUpdate >= updates.length) {
                client.receivedUpdates = [];
                curUpdate = 0;
                updates = [];
            }
            if (initialised) {
                while (client.tick == update.frame) {
                    if (update.name == "CREATE") {
                        //console.log("MADE");
                        var body = phys.objects[update.index];
                        var pos = update.data;

                        otherHandle = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(pos.x, pos.y, pos.z));
                        phys.dynamicsWorld.addConstraint(otherHandle);
                    } else if (update.name == "MOVE") {
                        var intersection = update.data;
                        otherHandle.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
                    } else if (update.name == "DESTROY") {
                        phys.dynamicsWorld.removeConstraint(otherHandle);
                        Ammo.destroy(otherHandle);

                        otherHandle = null;
                    } else if (update.name == "UPDATE_POS") {
                        var body = phys.objects[update.index];
                        var aVel = update.aVel;
                        var lVel = update.lVel;

                        var pos = update.pos;
                        var rot = update.rot;

                        var transform = body.getWorldTransform();
                        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
                        transform.setRotation(new Ammo.btQuaternion(rot.x, rot.y, rot.z, rot.w));

                        body.setAngularVelocity(new Ammo.btVector3(aVel.x, aVel.y, aVel.z));
                        body.setLinearVelocity(new Ammo.btVector3(lVel.x, lVel.y, lVel.z));
                    } else if (update.name == "RESET_ALL") {
                        //console.log("NEXT RESET "+update.frame);
                        resetFrame = update.frame;
                        props = update.props;

                        //console.log("DOING RESET");

                        physics.setAllObjectProps(props);

                        client.receivedUpdates.splice(0, curUpdate+1);
                        curUpdate = 0;
                        if (updates.length == 0)
                            break;

                        update = updates[curUpdate];
                        continue;
                    }
                    curUpdate++;
                    if (curUpdate >= updates.length) {
                        //console.log("CLEARING");
                        client.receivedUpdates = [];
                        curUpdate = 0;
                        updates = [];

                        break;
                    } else
                        update = updates[curUpdate];
                }
            }
        }

        world.update(10);

        /*if (world.picker.selected != null) {
            var body = world.picker.selected.userData.body;
            var aVel = body.getAngularVelocity();
            var lVel = body.getLinearVelocity();

            var i = 0;

            var objs = phys.objects;
            for (var c = 0; c < objs.length; c++) {
                if (body == objs[c]) {
                    i = c;
                    break;
                }
            }

            //console.log("body");
            //console.log(body.getWorldTransform());

            var mS = body.getMotionState();
            mS.getWorldTransform(_trans2);

            var origin = _trans2.getOrigin();
            var rotation = _trans2.getRotation();

            var pos = {x: origin.x(), y: origin.y(), z: origin.z()};
            var rot = {x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w()};

            var transform = body.getWorldTransform();
            //transform.setOrigin(new Ammo.btVector3(0, 1000, 0));
            //body.setWorldTransform(transform);
            //console.log(transform);

            //console.log("SDFsdFF");
            client.updates.push({name:"UPDATE_POS", index: i, 
                                 pos: pos,
                                 rot: rot,
                                 aVel: {x: aVel.x(), y: aVel.y(), z: aVel.z()}, 
                                 lVel: {x: lVel.x(), y: lVel.y(), z: lVel.z()}
                               });
                               

            if (world.picker.justFinished) {
                world.picker.justFinished = false;
                world.picker.selected = null;
            }
        }//*/

        lastTime = curTime;

        //requestAnimationFrame(animate);
    }
}

var _trans2 = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

main();