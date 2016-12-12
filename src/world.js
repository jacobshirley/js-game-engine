var _trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

function World(renderer, physics) {
    this.objects = [];
    this.renderer = renderer;
    this.physics = physics;
    this.picker = new Picker(this.renderer, this.physics);
    this.clock = new THREE.Clock();
    this.clock.start();
}

World.prototype.init = function() {
    this.renderer.init();
    this.physics.init();
}

World.prototype.destroy = function() {
    this.renderer.destroy();
    this.physics.destroy();
}

World.prototype.addObject = function(object) {
    this.objects.push(object);
    
    this.renderer.addObject(object);
    this.physics.addObject(object);
}

World.prototype.removeAll = function(destroy) {
    this.physics.removeAll(destroy);
    this.renderer.removeAll();

    this.objects = [];
}

World.prototype.update = function() {
    this.picker.update();

    var delta = this.clock.getDelta();

    this.physics.update(1/60);

    this.objects.forEach(function(obj) {
        body = obj.physicsData.body;
        mesh = obj.renderData.mesh;
        var mS = body.getMotionState();
        if (mS) {
            mS.getWorldTransform(_trans);

            var origin = _trans.getOrigin();
            var rotation = _trans.getRotation();

            mesh.position.set(origin.x(), origin.y(), origin.z());
            mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }
    });

    this.renderer.render();
}
