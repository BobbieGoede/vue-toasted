import { IToastObject, ToastElement } from "src/types";
import animations from "./animations";
import { Toasted } from "./toast";

export class ToastObject implements IToastObject {
	el: ToastElement = null;
	isDisposed: boolean = false;
	instance: Toasted = null;

	constructor(el: ToastElement, instance: Toasted) {
		this.el = el;
		this.instance = instance;
	}

	text(text: string | Node = "") {
		if (text instanceof Node) this.el.appendChild(text);
		if (typeof text === "string") this.el.innerHTML = text;

		return this;
	}

	goAway(delay = 800) {
		this.isDisposed = true;

		// Animate toast out
		setTimeout(() => {
			// if the toast is on bottom set it as bottom animation
			if (this.instance.cachedOptions?.position?.includes("bottom")) {
				animations.animateOutBottom(this.el, () => this.instance.remove(this.el));
				return;
			}

			animations.animateOut(this.el, () => this.instance.remove(this.el));
		}, delay);

		return true;
	}

	remove() {
		this.instance.remove(this.el);
	}

	disposed() {
		return this.isDisposed;
	}
}
