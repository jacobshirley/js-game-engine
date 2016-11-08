function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var renderer, physics, world;
    var clock = new THREE.Clock();

    function init() {
        renderer = new Renderer();
        physics = new Physics();

        world = new World(renderer, physics);
        world.init();
        world.picker.enabled = true;

        //create the lighting
        
        var light = new THREE.DirectionalLight(0xdfebff, 1.75);
        light.position.set(1000, 3000, 1000);
        light.position.multiplyScalar(1.3);

        light.castShadow = true;
        light.shadowCameraVisible = true;

        light.shadowMapWidth = 512 * 8;
        light.shadowMapHeight = 512 * 8;

        var d = 10000;

        light.shadowCameraLeft = -d;
        light.shadowCameraRight = d;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;

        light.shadowCameraFar = 10000;
        light.shadowDarkness = 0.5;

        renderer.createOrbitControls();
        renderer.addObject(light);
        renderer.addObject(new THREE.AmbientLight(0x404040));
    }

    init();

    var props = {size: {width: 5000, height: 500, length: 5000},
                 position: {x: 0, y: -1000, z: 0}, color: 0x00FFFF, mass:0};

    var floor = new Block(props);
    world.addObject(floor);

    var w = (500/1.5);
    for (var i = 0; i < 3*20; i++) {
        var mod = Math.floor(i/3);
        var height = mod*200;

        var props = {size: {width: 500/3, height: 500, length: 50},
                    color: 0xFFFFFF, mass:10};

        if (mod % 2 == 1) {
            props.position = {x: -w+((i%3)*w), y: -500+height, z: w};
            props.rotation = {x: (Math.PI/2), y: 0, z: 0};
        } else {
            props.position = {x: 0, y: -500+height, z: (i%3)*w};
            props.rotation = {x: (Math.PI/2), y: (Math.PI/2), z: 0};
        }
        world.addObject(new Block(props));
    }

    function animate() {
        requestAnimationFrame(animate);
        world.update();
    }

    animate();
}

main();