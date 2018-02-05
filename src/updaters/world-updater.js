import DelegateUpdater from "../base/engine/updates/delegate-updater.js";

export default class WorldUpdater extends DelegateUpdater {
	constructor(queue, delegate, world) {
		super(queue, delegate);
		this.world = world;
	}

	setWorld(world) {
		this.world = world;
	}

	process(update) {
		if (update.name == "INIT") {
			if (!this.pool.isHost) {
				this.world.reset(update.props);
			}
		} else if (update.name == "CONNECTED") {
			if (!this.pool.isHost) {
				this.pool.push({name: "REQ"});
			}
		} else if (update.name == "REQ") {
			if (this.pool.isHost) {
				let p = this.world.physics.getAllObjectProps();

				this.world.reset(p);
				this.pool.pushFramed({name: "INIT", props: p});
			}
		}

		return super.process(update);
	}
}
