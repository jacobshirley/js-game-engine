class Controller extends EventEmitter {
    constructor(id) {
        super();

        this.id = id;
        this.x = 0;
        this.y = 0;
        this.mouseDown = false;
    }
}

class LocalController extends Controller {
    constructor(id) {
        super(id);

        this.realX = 0;
        this.realY = 0;
        this.realMouseDown = false;

        this.updates = new UpdateStream();
        this.userData = {};

        $(window).mousedown((event) => {
           event.preventDefault();

           this.realX = (event.clientX / window.innerWidth) * 2 - 1;
           this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
           this.realMouseDown = true;

           this.updates.push({name: "MOUSE_DOWN", mouseDown: this.realMouseDown, x: this.realX, y: this.realY});
           this.emit("mousedown", this);
       });

       $(window).mouseup((event) => {
           event.preventDefault();

           this.realX = (event.clientX / window.innerWidth) * 2 - 1;
           this.realY = -(event.clientY / window.innerHeight) * 2 + 1;
           this.realMouseDown = false;

           this.updates.push({name: "MOUSE_UP", mouseDown: this.realMouseDown, x: this.realX, y: this.realY});
           this.emit("mouseup", this);
       });

       $(window).mousemove((event) => {
           event.preventDefault();

           this.realX = (event.clientX / window.innerWidth) * 2 - 1;
           this.realY = -(event.clientY / window.innerHeight) * 2 + 1;

           this.updates.push({name: "MOUSE_MOVE", x: this.realX, y: this.realY});
           this.emit("mousemove", this);
       });
    }
}

class Controllers extends EventEmitter {
    constructor(timer, client) {
        super();

        this.timer = timer;
        this.client = client;
        this.updates = 0;

        this.local = new LocalController(0);
        this.controllers = []; //not in use yet
    }

    getController(id) {
        for (let ct of this.controllers) {
            if (ct.id === id)
                return ct;
        }
    }

    update(frame) {
        let it = this.local.updates.iterator();
        while (it.hasNext()) {
            let u = it.remove();
            u.frame = frame;

            this.process(u);
        }
    }

    process(update) {
        if (update.name == "MOUSE_DOWN") {
            this.local.x = update.x;
            this.local.y = update.y;
            this.local.mouseDown = update.mouseDown;

            this.emit("mousedown", this.local);
        } else if (update.name == "MOUSE_UP") {
            this.local.x = update.x;
            this.local.y = update.y;
            this.local.mouseDown = update.mouseDown;

            this.emit("mouseup", this.local);
        } else if (update.name == "MOUSE_MOVE") {
            this.local.x = update.x;
            this.local.y = update.y;

            this.updates++;
            this.emit("mousemove", this.local);
        }
    }
}
