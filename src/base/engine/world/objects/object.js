export default class Object {
	constructor(props) {
		this.props = props;
		this.physicsData = {};
		if (this.renderable())
			this.renderData = {};
	}

	renderable() {
		return true;
	}

	synchronizer() {

	}
}
