import Renderer from "./ext/rendering/renderer.js";
import Dominos from "./dominos.js";
import LockstepEngine from "./base/engine/lockstep/lockstep-engine.js";
import ClientHandler from "./base/engine/lockstep/server/client-handler.js";

const SERVER_INDEX = 0;
const MAX_CLIENTS = 64;
const REFRESH_RATE = 1000 / 128;

function run() {
    let config = {clientInterface: new ClientHandler(8080, MAX_CLIENTS),
                  renderer: new Renderer(),
                  headless: true,
                  server: true,
                  maxFPS: 60,
                  sendOnFrame: 1,
                  port: 8080};

    let game = new Dominos(config);
    let engine = new LockstepEngine(game, config);

    setInterval(() => {
        engine.update();
    }, REFRESH_RATE);
}

run();

console.log("Running server...");
