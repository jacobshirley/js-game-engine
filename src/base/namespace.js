let namespaces = [];
let namespaceNames = [];

export default function (name, cls) {
    let i = namespaceNames.indexOf(name);
    let ns = null;

    if (i != -1) {
        ns = namespaces[i];
    } else {
        ns = new Namespace(name);
        namespaces.push(ns);
        namespaceNames.push(name);
    }

    if (typeof cls !== 'undefined')
        ns.addClass(cls);

    return ns;
}

class Namespace {
    constructor(path) {
        this.path = path || import.meta.url;
        this.classes = [];
        this.classNames = [];
    }

    addClass(cls) {
        let name = cls.constructor.name;
        if (this.classNames.indexOf(name) == -1) {
            this.classes.push(cls);
            this.classNames.push(name);
        }
    }

    removeClass(cls) {
        let i = this.classes.indexOf(cls);
        this.classes.splice(i, 1);
        this.classNames.splice(i, 1);
    }

    getClassByName(name) {
        let i = this.classNames.indexOf(name);
        if (i != -1)
            return this.class[i];
        return null;
    }
}
