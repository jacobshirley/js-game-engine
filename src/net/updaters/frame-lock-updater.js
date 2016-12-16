let start = Timer.currentTime;

let FPS = 120;
let UPDATE_INTERVAL = 1000/FPS;

class FrameLockUpdater extends UpdateProcessor {
    constructor(networking, frameLockThreshold, frameDelay) {
        super(networking);

        this.frameLockThreshold = frameLockThreshold;
        this.frameDelay = frameDelay;
    }

    process(update) {
        if (update.name == "SERVER_TICK") {
            console.log("SDFSDF");
            if (this.networking.isHost)
                return Networking.CONTINUE_DELETE;

            if (update.tick == this.networking.tick) {
                let deltaTime = this.networking.time - update.time;

                //setDebugText("DELTA: time: "+deltaTime+", ticks: "+deltaTicks);
                if (deltaTime < this.frameLockThreshold) {
                    let delay = new Delay(this.frameDelay, false);

                    delay.on('complete', () => {
                        this.networking.setTick(this.networking.tick-this.frameDelay);
                    });

                    this.networking.addDelay(delay);
                }
                return Networking.CONTINUE_DELETE;
            }

            return Networking.BREAK_NOTHING;
        }

        return Networking.SKIP;
    }
}