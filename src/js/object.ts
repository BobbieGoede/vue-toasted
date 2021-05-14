import { IToastObject, ToastElement } from "src/types";
import animations from "./animations";
import { Toasted } from "./toast";

// fade the toast away
export const goAway = (el: ToastElement, delay: number, instance: Toasted) => {
	// Animate toast out
	setTimeout(function () {
		// if the toast is on bottom set it as bottom animation
		if (instance.cached_options.position && instance.cached_options.position.includes("bottom")) {
			animations.animateOutBottom(el, () => instance.remove(el));
			return;
		}

		animations.animateOut(el, () => instance.remove(el));
	}, delay);

	return true;
};

// change the text of toast
export const changeText = (el: HTMLElement, text: string | Node) => {
	if (text == null) text = "";

	if (text instanceof Node) {
		el.appendChild(text);
	}

	if (typeof text === "string") {
		el.innerHTML = text;
	}

	return this;
};

export class ToastObject implements IToastObject {
	isDisposed: boolean = false;
	el: ToastElement = null;
	instance: Toasted = null;

	constructor(el: ToastElement, instance: Toasted) {
		this.el = el;
		this.instance = instance;
	}

	text(text) {
		changeText(this.el, text);
		return this;
	}

	goAway(delay = 800) {
		this.isDisposed = true;
		return goAway(this.el, delay, this.instance);
	}

	remove() {
		this.instance.remove(this.el);
	}

	disposed() {
		return this.isDisposed;
	}
}
