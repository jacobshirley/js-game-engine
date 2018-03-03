import EventEmitter from "../shims/events.js";

if (typeof window !== 'undefined') {
    var listeners = [];

    $(window).mousedown((event) => {
        event.preventDefault();

        for (let l of listeners)
            l.mousedown(event);
    });

    $(window).mouseup((event) => {
       event.preventDefault();

       for (let l of listeners)
           l.mouseup(event);
    });

    $(window).mousemove((event) => {
        event.preventDefault();

        for (let l of listeners)
            l.mousemove(event);
    });
}

export default class MouseController extends EventEmitter {
    constructor(id, networked) {
        super();

        this.id = id;
        this.x = 0;
        this.y = 0;
        this.mouseDown = false;

        this.realX = 0;
        this.realY = 0;
        this.realMouseDown = false;

        this.networked = networked;
        this.userData = {};
    }

    mousedown(event) {
        this.realX = (event.clientX / window.innerWidth) * 2 - 1;
        this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
        this.realMouseDown = true;

        this.queue.pushFramed({name: "MOUSE_DOWN", mouseDown: this.realMouseDown, x: this.realX, y: this.realY}, this.networked);
    }

    mouseup(event) {
        this.realX = (event.clientX / window.innerWidth) * 2 - 1;
        this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
        this.realMouseDown = false;

        this.queue.pushFramed({name: "MOUSE_UP", mouseDown: this.realMouseDown, x: this.realX, y: this.realY}, this.networked);
    }

    mousemove(event) {
        this.realX = (event.clientX / window.innerWidth) * 2 - 1;
        this.realY = -(event.clientY / window.innerHeight) * 2 + 1;

        this.queue.pushFramed({name: "MOUSE_MOVE", x: this.realX, y: this.realY}, this.networked);
    }

    init(queue) {
        this.queue = queue;
        listeners.push(this);
        this.queue.addProcessor(this);
    }

    destroy() {
        this.queue.removeProcessor(this);
        listeners.splice(listeners.indexOf(this), 1);
    }

    process(update) {
        if (update.name == "MOUSE_DOWN") {
            this.x = update.x;
            this.y = update.y;
            this.mouseDown = update.mouseDown;

            this.emit("mousedown", this);
        } else if (update.name == "MOUSE_UP") {
            this.x = update.x;
            this.y = update.y;
            this.mouseDown = update.mouseDown;

            this.emit("mouseup", this);
        } else if (update.name == "MOUSE_MOVE") {
            this.x = update.x;
            this.y = update.y;

            this.updates++;
            this.emit("mousemove", this);
        }
    }
}
