import Timer from "./timer.js";
import RenderTimer from "./render-timer.js";

const DEFAULT_UPDATE_RATE = 1000 / 60;

export default class GameTimer extends RenderTimer {
	constructor(timer, renderFunc, logicFunc) {
		super();

		this.renderFunc = renderFunc || (() => {});
		this.logicFunc = logicFunc || (() => {});

        this.updateInterval = DEFAULT_UPDATE_RATE;
        this.updateTimer = timer || new Timer();

        this.renderTime = 0;
        this.updateTime = 0;
        this.fps = 0;
        this.tempFPS = 0;

        this.ups = 0;
        this.tempUPS = 0;
    }

	setRenderFunction(func) {
		this.renderFunc = func;
	}

	setLogicFunction(func) {
		this.logicFunc = func;
	}

	setUpdateRate(updateRate) {
        this.updateInterval = 1000 / updateRate;
    }

	getDebugString() {
        return "Tick: "+this.updateTimer.tick+"<br /> Time (ms): "+this.updateTimer.time+"<br /> FPS: "+this.fps+"<br /> UPS: "+this.ups;
    }

	update() {
		let t = 0;

		while (this.updateTime >= this.updateInterval && t < 20) { // < 7 so it can catch up and doesn't go crazy
			if (!this.updateTimer.update(() => {
				this.logicFunc(this.updateTimer.tick);

				t++;

				this.updateTime -= this.updateInterval;
				this.tempUPS++;

				return true;
			})) {
				this.updateTime -= this.updateInterval;
			}
		}
	}

	render() {
		return super.update(() => {
            this.update();
			this.renderFunc();

            this.renderTime += this.deltaTime;
            this.updateTime += this.deltaTime;
            this.tempFPS++;

            if (this.renderTime >= 1000) {
                this.fps = this.tempFPS;
                this.ups = this.tempUPS;

                this.renderTime = 0;
                this.tempFPS = 0;
                this.tempUPS = 0;
            }

            return true;
        });
	}
}