"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _namespace = require("../../../namespace.js");

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ObjectSynchronizer {
  constructor(client, world) {
    this.client = client;
    this.tracked = [];
    this.world = world;
    this.namespaces = [];
  }

  get isServer() {
    return this.client.host();
  }

  addObjectClasses(namespace) {
    this.namespaces.push(namespace);
  }

  sync(object) {
    let syncer = object.synchronizer(); //this.tracked.push(syncer);
    //this.client.pushFramed({name: "REQ_SYNC", i: this.tracked.length - 1}, true);
  }

  update() {
    if (!this.isServer) return;
    let c = 0;

    for (let trackedObj of this.tracked) {
      let syncData = trackedObj.sync();

      if (typeof syncData !== 'undefined') {
        this.client.pushFramed({
          name: "SYNC_OBJ",
          i: c++,
          data: syncData
        }, true);
      }
    }
  }

  process(update) {
    if (update.name == "CLIENT_ADDED") {
      if (this.isServer) {
        let objects = this.world.objects;
        let data = [];

        for (let o of objects) {
          let s = o.synchronizer();
          let d = s.init();
          data.push(d);
        }

        this.client.pushFramed({
          name: "INIT_OBJECTS",
          data
        }, true);
      }
    } else if (update.name == "INIT_OBJECTS") {
      if (!this.isServer) {
        for (let d of update.data) {
          let ns = (0, _namespace2.default)(d.ns);
          console.log(ns.path);
        }
      } else {
        console.log("DDDD");
      }
    }
  }

}

exports.default = ObjectSynchronizer;