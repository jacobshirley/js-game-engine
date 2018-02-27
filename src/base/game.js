export default class Game {
    constructor(config) {
        this.config = config;
    }

    setEngine(engine) {
        this.engine = engine;
        this.queue = engine.queue;
    }

    get isServer() {
        return this.engine.isServer;
    }

    init() {}

    logic() {}

    render() {}
}
