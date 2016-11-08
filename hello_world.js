// Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function main() {
    var scene, controls, camera, renderer;
    var geometry, material, mesh;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(-1, -1);

    var draggingPlane = new THREE.Plane();

    var mouseHeld = false;

    var clock = new THREE.Clock();

    init();

    function init() {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
        camera.position.x = 2000;
        camera.position.y = 1000;
        camera.position.z = 2000;

        controls = new THREE.OrbitControls(camera);
        controls.staticMoving = true;
        controls.maxPolarAngle = Math.PI / 2;

        /*geometry = new THREE.SphereGeometry(100);
      material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );
    */

        var light;

        light = new THREE.DirectionalLight(0xdfebff, 1.75);
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

        scene.add(light);

        var ambLight = new THREE.AmbientLight(0x404040);
        scene.add(ambLight);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.appendChild(renderer.domElement);

    }

    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    //console.log(dynamicsWorld);

    var info = dynamicsWorld.getSolverInfo();
    //info.set_m_splitImpulse(1); //enable split impulse feature
    //info.set_m_splitImpulsePenetrationThreshold(-0.5);

    var bodies = [];
    var blocks = [];

    var floorMesh = null;

    function createStaticSide(x, y, z, xRot, yRot, zRot) {
        var width = 5000;
        var height = 500;
        var length = 5000;
        var sideShape = new Ammo.btBoxShape(new Ammo.btVector3(width, height, length));
        sideShape.setMargin(0.05);

        var sideTransform = new Ammo.btTransform();
        sideTransform.setIdentity();
        sideTransform.setOrigin(new Ammo.btVector3(x, y, z));
        sideTransform.setRotation(new Ammo.btQuaternion(xRot, yRot, zRot, 1));

        var mass = 0;
        var isDynamic = mass !== 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic)
            sideShape.calculateLocalInertia(mass, localInertia);

        var myMotionState = new Ammo.btDefaultMotionState(sideTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        dynamicsWorld.addRigidBody(body);
        bodies.push(body);

        //renderer
        var geometry = new THREE.BoxGeometry(width * 2, height * 2, length * 2);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ffff });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(x, y, z);
        scene.add(mesh);

        mesh.body = body;
        body.mesh = mesh;

        return mesh;
    }

    function createBox(x, y, z, xRot, yRot, zRot) {
        var width = 500/3;
        var height = 500;
        var length = 50;

        var size = new Ammo.btVector3(width, height, length);
        var sideShape = new Ammo.btBoxShape(size);
        sideShape.setMargin(0.05);

        var sideTransform = new Ammo.btTransform();
        sideTransform.setIdentity();
        sideTransform.setOrigin(new Ammo.btVector3(x, y, z));

        var quat = new Ammo.btQuaternion();
        quat.setEulerZYX(zRot, yRot, xRot);
        sideTransform.setRotation(quat);
        

        var mass = 2;
        var isDynamic = mass !== 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic)
            sideShape.calculateLocalInertia(mass, localInertia);

        var myMotionState = new Ammo.btDefaultMotionState(sideTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sideShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);
        body.setDamping(0, 0.2);
        body.setActivationState(4);
        //body.setFriction(1);

        dynamicsWorld.addRigidBody(body);
        bodies.push(body);

        //renderer
        var geometry = new THREE.BoxGeometry(width * 2, height * 2, length * 2);
        var material = new THREE.MeshPhongMaterial({ color: 0xffff00 });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(x, y, z);
        scene.add(mesh);

        mesh.body = body;
        body.mesh = mesh;

        return body;
    }

    (function() {
        floorMesh = createStaticSide(0, -1000, 0, 0, 0, 0);
        //createStaticSide(1000, 0, 0, 0, 0, 0);
    })();

    (function() {
      var w = (500/1.5);
        for (var i = 0; i < 3*20; i++) {
          var mod = Math.floor(i/3);
          var height = mod*100;
          console.log(i+", "+height);

          var b1;
          console.log((mod % 2 == 1))
          if (mod % 2 == 1) {
            b1 = createBox(-w+((i%3)*w), -500+height, w, (Math.PI/2), 0, 0);
          } else {
            b1 = createBox(0, -500+height, (i%3)*w, (Math.PI/2), (Math.PI/2), 0);
          }
          //console.log(b1);
          //b1.setAngularVelocity(new Ammo.btVector3(0, 0, 0.2));
          blocks.push(b1.mesh);
        }
    })();

    $(window).keydown(function(ev) {
        if (ev.keyCode == 65) {
            var b1 = createBox(20, 1010, -100, 0, 0, 0);
            //var b2 = createBox(20, 10, 0, 0, 0, 0);

            b1.setAngularVelocity(new Ammo.btVector3(0, 0, 0.2));

            blocks.push(b1.mesh);
        }
    });

    function inRange(x, min, max) {
            return x >= min && x <= max;
        }

    var mouseVelX = 0;
    var mouseVelY = 0;

    var lastX = 0;
    var lastY = 0;

    var mX = 0;
    var mY = 0;

    var moved = false;

    var SELECTED = null;
    var intersectionOffset = new THREE.Vector3();
    var hinge;
    var poss = new THREE.Vector3();
    var mouseDown = false;

    $(function() {
        $(window).mousedown(function(event) {
            event.preventDefault();

            mouseDown = mouseHeld = true;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        var done = true;
        $(window).mouseup(function(event) {
            event.preventDefault();

            if (SELECTED) {

              mouseHeld = false;
              SELECTED = null;


              draggingPlane = new THREE.Plane();
              dynamicsWorld.removeConstraint(hinge);
              Ammo.destroy(hinge);


              //console.log(controls);
              controls.noRotate = false;
            }

            done = true;
        });

        var intersection = new THREE.Vector3();
        $(window).mousemove(function(event) {
            event.preventDefault();

            moved = true;
            //if (done)
            //return;
            if (mouseHeld) {
                if (SELECTED) {
                    //console.log("DFFF");
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                }
            }

            //console.log(mouse); 
        });
    });

    var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

    function animate() {

        requestAnimationFrame(animate);

        //mesh.rotation.x += 0.01;
        //mesh.rotation.y += 0.02;
        //
        controls.update();
        update();

        var u = 0;

        scene.children.forEach(function(c) {
            //c.castShadow = true;
            //c.receiveShadow = true;
            u++;
        });



        /*scene.children.forEach(function(c) {
          c.material.wireframe = true;
        });*/

        renderer.render(scene, camera);
    }

    var deltaTime = clock.getDelta();

    function update() {
        if (mouseDown) {
            console.log("sdfsdfsdf");
            mouseDown = false;

            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(blocks);

            if (intersects.length > 0) {
                SELECTED = intersects[0].object;
                var body = SELECTED.body;
                //console.log(body.getMotionState());

                draggingPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(draggingPlane.normal), intersects[0].point);

                var lastIntersection = new THREE.Vector3();
                var intersection = new THREE.Vector3();
                lastIntersection.copy(intersection);

                if (raycaster.ray.intersectPlane(draggingPlane, intersection)) {
                    controls.noRotate = true;
                    intersectionOffset.copy(intersection).sub(SELECTED.position);

                    var faceNormal = raycaster.intersectObject(SELECTED)[0].face.normal;
                    var p = new THREE.Vector3();
                    p.copy(intersects[0].point);
                    var pos = SELECTED.worldToLocal(intersects[0].point);

                    intersectionOffset = pos;//new THREE.Vector3(0, 0, 0);
                    //body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
                    //body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
                    //
                    //intersectionOffset = new THREE.Vector3(0, -500, 0);

                    //hinge = new Ammo.btHingeConstraint(body, new Ammo.btVector3(intersectionOffset.x, intersectionOffset.y, intersectionOffset.z), faceNormal);
                    hinge = new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(intersectionOffset.x, intersectionOffset.y, intersectionOffset.z));

                    intersection = p;
                    hinge.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));

                    //new Ammo.btHingeConstraint(b1, b2, new Ammo.btVector3(0, -500, 0), new Ammo.btVector3(0, 500, 0), new Ammo.btVector3(1, 0, 0), new Ammo.btVector3(1, 0, 0));
                    dynamicsWorld.addConstraint(hinge);


                    var setting = hinge.get_m_setting();
                    //setting.set_m_impulseClamp(120);
                    setting.set_m_tau(0.001);

                    //body.applyForce(new Ammo.btVector3(10, 0, 0));
                }
            }
        }
        if (moved && mouseHeld) {
            moved = false;
            if (SELECTED) {
                raycaster.setFromCamera(mouse, camera);

                var intersects = raycaster.intersectObjects(blocks);

                //if (intersects.length > 0) {
                  var lastIntersection = new THREE.Vector3();
                  var intersection = new THREE.Vector3();
                  lastIntersection.copy(intersection);

                  if (raycaster.ray.intersectPlane(draggingPlane, intersection)) {
                      var newInt = new THREE.Vector3();
                      newInt.copy(intersection);
                      var localPos = floorMesh.worldToLocal(newInt);

                      var X = 5000;
                      var Y = 500;
                      var Z = 5000;

                      if (inRange(localPos.x, -X, X) && inRange(localPos.y, -Y-10000, Y) && inRange(localPos.z, -Z, Z)) {
                        console.log("in range in x "+inRange(localPos.x, -X, X)+", "+localPos.x);
                        console.log("in range in y "+inRange(localPos.y, -Y-10000, Y)+", "+localPos.y);
                        console.log("in range in z "+inRange(localPos.z, -Z, Z)+", "+localPos.z);
                       //return;
                      } else {
                        var loc = SELECTED.localToWorld(new THREE.Vector3(0, 0, 0));
                        var xDiff = intersection.x-loc.x;
                        var yDiff = intersection.y-loc.y;
                        var zDiff = intersection.z-loc.z;

                        //intersection = intersects[0].point;
                        //console.log(SELECTED.worldToLocal(new THREE.Vector3(intersection.x-xDiff, intersection.y-yDiff, intersection.z-zDiff)));
                        hinge.setPivotB(new Ammo.btVector3(intersection.x, intersection.y, intersection.z));
                      }
                  }
               // }

                

                //return;
            }
        }//*/
        //if (SELECTED != null) 
        //SELECTED.body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
        dynamicsWorld.stepSimulation(1, 10);


        bodies.forEach(function(body) {
            if (body.getMotionState()) {
                body.getMotionState().getWorldTransform(trans);

                var origin = trans.getOrigin();
                var rotation = trans.getRotation();

                body.mesh.position.set(origin.x(), origin.y(), origin.z());
                body.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
                //console.log("world pos = " + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
            }
        });
    }

    //setInterval(30);

    animate();
    //for (var i = 0; i < 135; i++) {

    //}

    // Delete objects we created through |new|. We just do a few of them here, but you should do them all if you are not shutting down ammo.js
    //Ammo.destroy(collisionConfiguration);
    //Ammo.destroy(dispatcher);
    //Ammo.destroy(overlappingPairCache);
    //Ammo.destroy(solver);
    //Ammo.destroy(dynamicsWorld); // XXX gives an error for some reason, |getBroadphase()->getOverlappingPairCache()->cleanProxyFromPairs(bp,m_dispatcher1);| in btCollisionWorld.cpp throws a 'pure virtual' failure

    console.log('ok.');

    var Z_INC = 50;
    var Y_INC = 50;
    var INC = Math.PI / 100;

    var rot = Math.PI / 2;
    var radius = camera.position.z;

    $(window).keydown(function(ev) {
        /*if (ev.keyCode == 87) {
          camera.position.y += Y_INC;
        } else if (ev.keyCode == 83) {
          camera.position.y -= Y_INC;
        }

        if (ev.keyCode == 90) {
          camera.position.z -= Z_INC;
          radius = camera.position.z;
        } else if (ev.keyCode == 88) {
          camera.position.z += Z_INC;
          radius = camera.position.z;
        }
    
        if (ev.keyCode == 65) {
            rot += INC;

            camera.position.x = radius * Math.cos( rot );  
            camera.position.z = radius * Math.sin( rot );
            camera.rotation.y -= INC;

        } else if (ev.keyCode == 68) {
            rot -= INC;

            camera.position.x = radius * Math.cos( rot );  
            camera.position.z = radius * Math.sin( rot );
            camera.rotation.y += INC;
        }*/
        if (ev.keyCode == 65) {

        }
    });
}

main();
