import LockstepUpdateQueue from "./lockstep-queue.js";
import LockstepTimer from "./lockstep-timer.js";
import GameTimer from "../base/timing/game-timer.js";
import Interval from "../base/timing/interval.js";
import Controllers from "../base/controller/controllers.js";

export default class LockstepEngine {
    constructor(game, config) {
        this.game = game;

        this.config = config;
        this.clientInterface = config.clientInterface;

        if (this.clientInterface.connected) {
            this._build();
        } else {
            this.clientInterface.on("connected", () => {
                this._build();
            });
        }
    }

    get isServer() {
        return this.clientInterface.getLocalClient().host();
    }

    _build() {
        this.queue = new LockstepUpdateQueue(this.clientInterface.getLocalClient(), this.clientInterface.getClients());
        this.renderTimer = new LockstepTimer(this, 4, 2, 7, 1000);
        this.logicTimer = this.renderTimer.logicTimer;

        this.queue.addProcessor(this.renderTimer);

        this.controllers = new Controllers(this.queue);

        if (!this.config.headless) {
            this.renderTimer.setRenderFunction(() => {
                this.game.render();
            });
        } else {
            this.renderTimer.setRenderFunction(() => {});
        }

        this.renderTimer.setLogicFunction((frame) => {
            this.clientInterface.update(frame);
            this.queue.update(frame);
            this.game.logic(frame);
        });

        if (typeof this.config.maxFPS !== 'undefined')
            this.renderTimer.setMaxFrames(this.config.maxFPS);

        if (typeof this.config.updatesPerSecond !== 'undefined')
            this.renderTimer.setUpdateRate(this.config.updatesPerSecond);

        const sendInterval = new Interval(this.config.sendOnFrame, true);
        sendInterval.on('complete', () => {
            this.clientInterface.flush();
            //console.log(this.getDebugString());
        });

        this.logicTimer.addInterval(sendInterval);

        this.game.setEngine(this);
        this.game.init();
    }

    getDebugString() {
        return "FPS: " + this.renderTimer.fps + "<br />" +
               "UPS: " + this.renderTimer.ups + "<br />" +
               "Frame: " + this.logicTimer.tick + "<br />" +
               "Net updates: " + this.queue.processedUpdates;
    }

    update() {
        if (this.clientInterface.connected) {
            this.renderTimer.render();
        } else {
            this.clientInterface.update();
        }
    }

    start() {
        this._start();
    }

    _start() {
        requestAnimationFrame(() => {
            this.update();

            this._start();
        });
    }

    restart() {
        this.renderTimer.reset();
        this.logicTimer.reset();

        this.clientInterface.clear();
        this.clientInterface.reconnect();

        this.game.destroy();
    }
}
