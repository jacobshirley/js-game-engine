import Renderer from "./renderer.js";

export default class DOMRenderer extends Renderer {
	constructor(domOwner) {
        super();

        this.domOwner = domOwner;
	}
}
