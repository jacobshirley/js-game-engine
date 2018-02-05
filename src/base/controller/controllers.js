export default class Controllers {
    constructor(queue) {
        this.queue = queue;
        this.cont = [];
    }

    add(controller) {
        controller.init(this.queue);

        this.cont.push(controller);
    }

    remove(controller) {
        //to do
    }
}
