import DelegateUpdater from "../delegate-updater.js";

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
				let timer = this.world.updateTimer;
				let p = this.world.physics.getAllObjectProps();

				this.world.reset(p);
				this.pool.push({name: "INIT", frame: timer.tick, props: p});
			}
		}

		return super.process(update);
	}
}
