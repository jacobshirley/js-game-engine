export default class Component {
    constructor(name) {
        this.name = name;
    }

    getUpdater() {}
    getStateManager() {}

    onDisconnect() {}

    logic(frame) {}
    render() {}
}
