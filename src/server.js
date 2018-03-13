import Jenga from "./jenga.js";
import LockstepEngine from "./lockstep/lockstep-engine.js";
import ClientHandler from "./lockstep/server/client-handler.js";

const FRAMES_PER_SECOND = 128;

function run() {
    let config = {clientInterface: new ClientHandler(8080),
                  headless: true,
                  server: true,
                  sendOnFrame: 1,
                  port: 8080};

    let game = new Jenga(config);
    let engine = new LockstepEngine(game, config);

    const REFRESH_RATE = 1000 / FRAMES_PER_SECOND;

    setInterval(() => {
        engine.update();
    }, REFRESH_RATE);
}

run();

console.log("Running server...");
