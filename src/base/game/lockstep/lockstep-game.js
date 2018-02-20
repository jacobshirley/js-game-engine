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

        this.tabActive = true;

		if (typeof window !== 'undefined') {
			$(window).focus(() => {
			    this.tabActive = true;
			});

			$(window).blur(() => {
			    this.tabActive = false;
			});
		}
    }

    get isServer() {
        return this.multiplayer.getLocalClient().host();
    }

    _build() {
        this.queue = new LockstepUpdateQueue(this.multiplayer.getLocalClient(), this.multiplayer.getClients());
        this.timer = new LockstepTimer(this.queue, 3, 2, 50);

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

        if (typeof this.config.maxFPS !== 'undefined')
            this.renderTimer.setMaxFrames(this.config.maxFPS);

        if (typeof this.config.updatesPerSecond !== 'undefined')
            this.renderTimer.setUpdateRate(this.config.updatesPerSecond);

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
               "Frame: " + this.timer.tick + "<br />" +
               "Net updates: " + this.queue.processedUpdates;
    }

    update() {
        if (this.multiplayer.connected && this.renderTimer) {
            this.renderTimer.render();
        } else {
            this.multiplayer.update();
        }
    }

    start() {
        if (typeof window !== 'undefined') {
            setInterval(() => {
                if (document.visibilityState == "hidden") {
                    this.update();
                }
            }, 1000 / 128);

            this._start();
        }
    }

    _start() {
        requestAnimationFrame(() => {
            this.update();

            this._start();
        });
    }
}
