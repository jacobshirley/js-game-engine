class BasicIterator {
	constructor(updateData, copy) {
		this.updateData = updateData;
		this.index = 0;
		if (copy)
			this.updateData = [].concat(updateData);
	}

	hasNext() {
		return this.index < this.updateData.length;
	}

	next() {
		return this.updateData[this.index++];
	}

	remove() {
		this.index--;
		if (this.index <= 0) {
			this.index = 0;
			return this.updateData.shift();
		}
		return this.updateData.splice(this.index, 1);
	}
}
