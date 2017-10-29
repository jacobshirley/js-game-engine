class LockstepQueueError extends Error {
    constructor(delay, ...params) {
        super(...params);
        this.delay = delay;
        this.message = "Lockstep needs to delay execution";
    }
}
