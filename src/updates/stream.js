import BasicIterator from "./iteration.js";

export default class UpdateStream {
	constructor(updates) {
		this.updates = updates || [];
	}

	push(update) {
		this.updates.push(update);
	}

	iterator() {
		return new BasicIterator(this.updates, false);
	}
}
