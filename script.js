import {TestConnection, WebSocketConnection} from "./src/base/net/connection.js";
import LockstepEngine from "./src/lockstep/lockstep-engine.js";
import ServerHandler from "./src/lockstep/client/server-handler.js";
import ServerTestHandler from "./src/lockstep/client/server-test-handler.js";

import Dominos from "./src/dominos.js";
import Namespace from "./src/base/namespace.js";

const test = true;

function main() {
    let connection = null;

    if (!test) {
        connection = new WebSocketConnection("ws://" + window.location.hostname + ":8080/");
    }

    const config = {
        clientInterface: test ? new ServerTestHandler() : new ServerHandler(connection),
        connection: connection,
        sendOnFrame: 2
    };

    window.game = new Dominos(config);

    let engine = new LockstepEngine(window.game, config);
    engine.start();
}

main();
