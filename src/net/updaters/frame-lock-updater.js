var start = Timer.currentTime;

var FPS = 120;
var UPDATE_INTERVAL = 1000/FPS;

class FrameLockUpdater extends UpdateProcessor {
    constructor(networking, frameLockThreshold, frameDelay) {
        super(networking);

        this.frameLockThreshold = frameLockThreshold;
        this.frameDelay = frameDelay;
    }

    process(update) {
        if (update.name == "SERVER_TICK") {
            if (this.networking.isHost)
                return Networking.CONTINUE_DELETE;

            if (update.tick == this.networking.tick) {
                let deltaTime = Timer.currentTime - update.time;
                let deltaTicks = deltaTime/UPDATE_INTERVAL;

                //setDebugText("DELTA: time: "+deltaTime+", ticks: "+deltaTicks);
                if (deltaTicks < this.frameLockThreshold) {
                    var delay = new Delay(this.frameDelay);

                    delay.on('finished', () => {
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