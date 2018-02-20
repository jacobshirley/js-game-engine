import UpdateProcessor from "../updates/update-processor.js";

export default class WorldUpdater extends UpdateProcessor {
	constructor(queue, world) {
		super(queue);
		
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
				let props = this.world.physics.getAllObjectProps();

				this.pool.pushFramed({name: "CREATE_WORLD", props}, true);
			}
		}
	}
}
