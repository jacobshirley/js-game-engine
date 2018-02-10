import Timer from "./base/engine/timing/timer.js";
import UpdateStream from "./base/engine/updates/stream.js";
import BasicIterator from "./base/engine/updates/iteration.js";
import Renderer from "./base/engine/rendering/renderer.js";
import Dominos from "./dominos.js";
import EventEmitter from "./base/shims/events.js";

import GameServer from "./base/multiplayer/server/game-server.js";

const SERVER_INDEX = 0;
const MAX_CLIENTS = 64;
const REFRESH_RATE = 1000 / 128;

function run() {
    let server = new GameServer(8080, MAX_CLIENTS);

    let config = {multiplayer: server,
                  renderer: new Renderer(),
                  headless: true,
                  server: true};

    let game = new Dominos(config);

    setInterval(() => {
        game.update();
        //console.log(game.getDebugString());
    }, REFRESH_RATE);
}

run();

console.log("Running server...");
