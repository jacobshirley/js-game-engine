import {TestConnection, WebSocketConnection} from "./src/base/net/connection.js";
import ThreeRenderer from "./src/base/engine/world/rendering/three/renderer.js";
import ServerConnection from "./src/base/multiplayer/client/server-connection.js";
import ServerTestConnection from "./src/base/multiplayer/client/server-test-connection.js";
import Dominos from "./src/dominos.js";
import Namespace from "./src/base/namespace.js";

const test = false;

function main() {
    var connection = new TestConnection(50, 0);

    if (!test) {
        connection = new WebSocketConnection("ws://" + window.location.hostname + ":8080/");
    }

    const config = {
        multiplayer: test ? new ServerTestConnection() : new ServerConnection(connection),
        renderer: new ThreeRenderer(document.body),
        updatesPerSecond: 60,
        maxFPS: 1000
    };

    let game = new Dominos(config);
    game.start();
}

main();
