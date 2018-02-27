import {TestConnection, WebSocketConnection} from "./src/base/net/connection.js";
import ThreeRenderer from "./src/ext/rendering/three/renderer.js";
import LockstepEngine from "./src/base/engine/lockstep/lockstep-engine.js";
import ServerHandler from "./src/base/engine/lockstep/client/server-handler.js";
import ServerTestHandler from "./src/base/engine/lockstep/client/server-test-handler.js";

import Dominos from "./src/dominos.js";
import Namespace from "./src/base/namespace.js";

const test = false;

function main() {
    let connection = null;

    if (!test) {
        connection = new WebSocketConnection("ws://" + window.location.hostname + ":8080/");
    }

    const config = {
        clientInterface: test ? new ServerTestHandler() : new ServerHandler(connection),
        connection: connection,
        renderer: new ThreeRenderer(document.body),
        sendOnFrame: 2
    };

    window.game = new Dominos(config);

    let engine = new LockstepEngine(window.game, config);
    engine.start();
}

main();
