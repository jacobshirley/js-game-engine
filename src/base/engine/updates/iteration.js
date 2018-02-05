export default class BasicIterator {
	constructor(data, copy) {
		this.data = data;
		this.index = 0;
		//copy = copy || true;
		if (copy)
			this.data = [].concat(data);
	}

	hasNext() {
		return this.index < this.data.length;
	}

	next() {
		return this.data[this.index++];
	}

	remove() {
		this.index--;
		if (this.index <= 0) {
			this.index = 0;
			return this.data.shift();
		}
		return this.data.splice(this.index, 1);
	}
}
