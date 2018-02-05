import Game from "../game.js";
import LockstepUpdateQueue from "./lockstep-queue.js";
import LockstepTimer from "./lockstep-timer.js";
import GameTimer from "../../engine/timing/game-timer.js";
import Interval from "../../engine/timing/interval.js";
import Controllers from "../../controller/controllers.js";

export default class LockstepGame extends Game {
    constructor(config) {
        super();

        this.config = config;

        this.multiplayer = config.multiplayer;
        this.renderer = config.renderer;

        if (this.multiplayer.connected) {
            this._build();
        } else {
            this.multiplayer.on("connected", () => {
                this._build();
            });
        }
    }

    static get isServer() {
        return this.multiplayer.local.isHost;
    }

    _build() {
        this.queue = new LockstepUpdateQueue(this.multiplayer.getLocalClient(), this.multiplayer.getClients());
        this.timer = new LockstepTimer(this.queue, 5);

        this.controllers = new Controllers(this.queue);

        this.queue.addProcessor(this.timer);

        this.renderTimer = new GameTimer(this.timer);

        if (!this.config.headless) {
            this.renderTimer.setRenderFunction(() => {
                this.render();
            });
        } else {
            this.renderTimer.setRenderFunction(() => {});
        }

        this.renderTimer.setLogicFunction((frame) => {
            this.multiplayer.update(frame);
            this.queue.update(frame);
            this.logic(frame);
        });

        const sendInterval = new Interval(2, true);
        sendInterval.on('complete', () => {
            this.multiplayer.flush();
        });

        this.renderTimer.addInterval(sendInterval);

        this.init();
    }

    getDebugString() {
        return "FPS: " + this.renderTimer.fps + "<br />" +
               "UPS: " + this.renderTimer.ups + "<br />" +
               "Frame: " + this.timer.tick;
    }

    update() {
        if (this.multiplayer.connected && this.renderTimer) {
            this.renderTimer.render();
        } else {
            this.multiplayer.update();
        }
    }

    start() {
        requestAnimationFrame(() => {
            this.update();

            requestAnimationFrame(() => {
                this.start();
            });
        });
    }
}
