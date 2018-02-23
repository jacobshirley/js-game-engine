"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stream = require("../../engine/updates/streamed/stream.js");

var _stream2 = _interopRequireDefault(_stream);

var _streamUpdateQueue = require("../../engine/updates/streamed/stream-update-queue.js");

var _streamUpdateQueue2 = _interopRequireDefault(_streamUpdateQueue);

var _lockstepQueueError = require("./lockstep-queue-error.js");

var _lockstepQueueError2 = _interopRequireDefault(_lockstepQueueError);

var _events = require("../../shims/events.js");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LATENCY = 20;

class LockstepUpdateQueue extends _streamUpdateQueue2.default {
  constructor(local, clients) {
    super(local, clients);
    this.updates = [];
    this.controlServerID = -1;
  }

  setControlServer(id) {
    this.controlServerID = id;
  }

  queueLocalUpdates() {
    this.updates = this.updates.concat(this.local.localUpdates.splice(0));
  }

  queueUpdates(frame) {
    let applied = []; //process host first

    let stream = this.clients.host();
    let it = stream.iterator();

    while (it.hasNext()) {
      let u = it.next();
      u.__clId = stream.id();

      if (u.frame == frame) {
        it.remove();

        if (u.name == "APPLY") {
          let data = u.updateMeta;

          for (let d of data) {
            let cl = this.clients.get(d.id);
            cl.toBeRead = d.count; //console.log(u);
          }
        }

        this.updates.push(u);
      } else if (u.frame < frame) {
        //console.log("frame behind: "+u.frame+" < "+frame+": "+u.name);
        it.remove();
      } else if (!u.frame) {
        it.remove();
        this.updates.push(u);
      }
    } //every other stream


    let clients = this.clients.iterator();

    while (clients.hasNext()) {
      stream = clients.remove();

      if (!stream.host()) {
        let it = stream.iterator();

        if (this.isHost) {
          let i = 0;
          let updated = it.hasNext();

          while (it.hasNext()) {
            let u = it.remove();
            u.__clId = stream.id();
            this.updates.push(u);
            i++;
          }

          if (updated) {
            //console.log("applied "+i+ " on frame "+frame);
            applied.push({
              id: stream.id(),
              count: i
            });
          }
        } else {
          if (stream.toBeRead > 0) {
            //console.log("applied "+stream.toBeRead+" on frame "+frame);
            while (it.hasNext() && stream.toBeRead-- > 0) {
              let u = it.remove();
              u.__clId = stream.id();
              this.updates.push(u);
            }

            if (stream.toBeRead > 0) {
              console.log("stream need to read " + stream.toBeRead); //console.log(stream);

              throw new _lockstepQueueError2.default(-1);
            }
          }
        }
      }
    }

    if (this.isHost && applied.length > 0) {
      this.local.push({
        name: "APPLY",
        frame,
        updateMeta: applied
      }, true);
    }
  }

  handleUpdates(frame) {
    while (this.updates.length > 0) {
      let u = this.updates.shift();

      for (let processor of this.processors) {
        processor.process(u);
      }

      this.processedUpdates++;
    }
  }

  update(frame) {
    super.update();
    this.queueLocalUpdates(frame);
    this.queueUpdates(frame);
    this.handleUpdates(frame);
  }

}

exports.default = LockstepUpdateQueue;