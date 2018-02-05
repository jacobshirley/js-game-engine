import UpdateProcessor from "./update-processor.js";

export default class DelegateUpdater extends UpdateProcessor {
	constructor(pool, delegate) {
		super(pool);

		this.delegate = delegate;
	}

	setDelegate(delegate) {
		this.delegate = delegate;
	}

	process(update) {
		if (this.delegate)
			this.delegate.process(update);
	}
}
