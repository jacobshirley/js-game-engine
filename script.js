import {TestConnection, WebSocketConnection} from "./src/base/net/connection.js";
import ThreeRenderer from "./src/base/engine/rendering/three/renderer.js";
import ServerConnection from "./src/base/multiplayer/client/server-connection.js";
import ServerTestConnection from "./src/base/multiplayer/client/server-test-connection.js";
import Dominos from "./src/dominos.js";

function main() {
    var connection = new TestConnection(50, 0);
    //connection = new WebSocketConnection("ws://127.0.0.1:8080/");

    const config = {
        multiplayer: new ServerTestConnection(),
        renderer: new ThreeRenderer(document.body)
    };

    let game = new Dominos(config);
    game.start();
}

main();
