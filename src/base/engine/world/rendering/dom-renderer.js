import Renderer from "./renderer.js";

export default class DOMRenderer extends Renderer {
	constructor(domOwner) {
        super();

        this.domOwner = domOwner;
		this.tabActive = true;

		if (typeof window !== 'undefined') {
			$(window).focus(() => {
			    this.tabActive = true;
			});

			$(window).blur(() => {
			    this.tabActive = false;
			});
		}
	}
}
