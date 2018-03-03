import Renderer from "./renderer.js";

export default class DOMRenderer {
	constructor(domOwner) {
        this.domOwner = domOwner;
		this.tabActive = true;

		$(window).focus(() => {
		    this.tabActive = true;
		});

		$(window).blur(() => {
		    this.tabActive = false;
		});

		$(window).resize(() => {
			this.resize(window.innerWidth, window.innerHeight);
		});
	}
}
