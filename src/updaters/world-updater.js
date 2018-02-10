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
		if (update.name == "CREATE_WORLD") {
			this.world.reset(update.props);
		} else if (update.name == "INIT") {
			if (!this.pool.isHost) {
				this.pool.push({name: "INIT_WORLD"}, true);
			}
		} else if (update.name == "INIT_WORLD") {
			if (this.pool.isHost) {
				let p = this.world.physics.getAllObjectProps();

				this.pool.pushFramed({name: "CREATE_WORLD", props: p}, true);
			}
		}

		return super.process(update);
	}
}
