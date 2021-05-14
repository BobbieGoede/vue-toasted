import Hammer from "hammerjs";
import animations from "./animations";
import uuid from "shortid";
import {
	IToastAction,
	ToastElement,
	IToastOptions,
	ToastPosition,
	ToastIconPack,
	ToastIconPackObject,
} from "src/types";
import { ToastObject } from "./object";
import { Toasted } from "./toast";

let _options: IToastOptions = {};
let _instance: Toasted = null;

class ToastOptions implements IToastOptions {
	onComplete = null;
	position: ToastPosition = "top-right";
	duration = null;
	keepOnHover = false;
	theme = "toasted-primary";
	type = "default";
	containerClass: string[] = [];
	icon = null;
	action = null;
	closeOnSwipe = true;
	iconPack: string | ToastIconPack | ToastIconPackObject = "material";
	className: string[] = [];

	constructor(o: IToastOptions) {
		if (o.onComplete) this.onComplete = o.onComplete;
		if (o.position) this.position = o.position;
		if (o.duration) this.duration = o.duration;
		if (o.keepOnHover) this.keepOnHover = o.keepOnHover;
		if (o.theme) this.theme = o.theme;
		if (o.type) this.type = o.type;
		if (o.icon) this.icon = o.icon;
		if (o.action) this.action = o.action;
		if (o.closeOnSwipe) this.closeOnSwipe = o.closeOnSwipe;
		if (o.iconPack) this.iconPack = o.iconPack;
		if (typeof o.className === "string") this.className = o.className.split(" ");
		if (typeof o.containerClass === "string") this.containerClass = o.containerClass.split(" ");

		if (this.theme) this.className.push(this.theme.trim());
		if (this.type) this.className.push(this.type);

		if (this.position) this.containerClass.push(this.position.trim());
		if (o.fullWidth) this.containerClass.push("full-width");
		if (o.fitToScreen) this.containerClass.push("fit-to-screen");

		_options = this;
	}
}

const createToast = function (html: HTMLElement | string, options: IToastOptions): ToastElement {
	const toastEl: ToastElement = document.createElement("div");
	toastEl.classList.add("toasted");
	toastEl.hash = uuid.generate();

	if (options.className && Array.isArray(options.className)) {
		options.className.forEach((className) => toastEl.classList.add(className));
	}

	if (html instanceof HTMLElement) {
		toastEl.appendChild(html);
	} else {
		const messageElement = document.createElement("span");
		messageElement.classList.add("toasted-message");
		messageElement.innerHTML = html;
		toastEl.appendChild(messageElement);
	}

	if (options.icon) {
		const icon = createIcon(options);

		if (typeof options.icon === "object" && options.icon.after) {
			toastEl.appendChild(icon);
		} else {
			toastEl.insertBefore(icon, toastEl.firstChild);
		}
	}

	if (options.closeOnSwipe) {
		const hammerHandler = new Hammer(toastEl);

		hammerHandler.on("pan", (e) => {
			const deltaX = e.deltaX;
			const activationDistance = 80;

			// Change toast state
			if (!toastEl.classList.contains("panning")) {
				toastEl.classList.add("panning");
			}

			let opacityPercent = 1 - Math.abs(deltaX / activationDistance);
			if (opacityPercent < 0) opacityPercent = 0;

			animations.animatePanning(toastEl, deltaX, opacityPercent);
		});

		hammerHandler.on("panend", (e) => {
			const deltaX = e.deltaX;
			const activationDistance = 80;

			// If toast dragged past activation point
			if (Math.abs(deltaX) > activationDistance) {
				animations.animatePanEnd(toastEl, function () {
					if (typeof options.onComplete === "function") {
						options.onComplete();
					}

					if (toastEl.parentNode) {
						_instance.remove(toastEl);
					}
				});
			} else {
				toastEl.classList.remove("panning");
				// Put toast back into original position
				animations.animateReset(toastEl);
			}
		});
	}

	// create and append actions
	if (options.action) {
		options.action = Array.isArray(options.action) ? options.action : [options.action];
		options.action.forEach((action) => {
			const el = createAction(action, new ToastObject(toastEl, _instance));
			if (el) toastEl.appendChild(el);
		});
	}

	return toastEl;
};

const createIcon = (options) => {
	let iconEl = document.createElement("i");
	iconEl.setAttribute("aria-hidden", "true");

	if (typeof options.iconPack === "string") {
		let iconClass = options.icon?.name ?? options.icon;
		iconClass = iconClass.trim();

		switch (options.iconPack) {
			case "fontawesome":
				iconEl.classList.add("fa");
				iconEl.classList.add(iconClass.includes("fa-") ? iconClass : `fa-${iconClass}`);

				break;
			case "mdi":
				iconEl.classList.add("mdi");
				iconEl.classList.add(iconClass.includes("mdi-") ? iconClass : `mdi-${iconClass}`);

				break;
			case "custom-class":
				let classArray = Array.isArray(iconClass) ? iconClass : iconClass.split(" ");
				classArray.forEach((className) => iconEl.classList.add(className.trim()));

				break;
			case "callback":
				let callback = options.icon && options.icon instanceof Function ? options.icon : null;
				if (callback) {
					iconEl = callback(iconEl);
				}

				break;
			default:
				iconEl.classList.add("material-icons");
				iconEl.textContent = options.icon?.name ?? options.icon;
		}
	}

	if (typeof options.iconPack === "object") {
		const iconClasses = options.iconPack.classes ?? ["material-icons"];
		iconClasses.forEach((iconClass) => iconEl.classList.add(iconClass));

		if (options.iconPack.textContent) {
			iconEl.textContent = options.icon?.name ?? options.icon;
		}
	}

	if (options.icon.after) {
		iconEl.classList.add("after");
	}

	return iconEl;
};

/**
 * Create Action for the toast
 *
 * @param action
 * @param toastObject
 * @returns {Element}
 */
const createAction = (action: IToastAction, toastObject: ToastObject) => {
	const el = document.createElement(action.href ? "a" : "button");

	el.classList.add("action");
	el.classList.add("ripple");

	if (el instanceof HTMLButtonElement) {
		if (action.text) el.textContent = action.text;
	}

	if (el instanceof HTMLAnchorElement) {
		if (action.text) el.text = action.text;
		if (action.href) el.href = action.href;
	}

	// if (action.target) {
	// 	el.target = action.target;
	// }

	if (action.icon) {
		el.classList.add("icon");
		const iconEl = document.createElement("i");

		if (typeof _options.iconPack === "string") {
			const iconClass = action.icon.trim();

			switch (_options.iconPack) {
				case "fontawesome":
					iconEl.classList.add("fa");
					iconEl.classList.add(iconClass.includes("fa-") ? iconClass : `fa-${iconClass}`);

					break;
				case "mdi":
					iconEl.classList.add("mdi");
					iconEl.classList.add(iconClass.includes("mdi-") ? iconClass : `mdi-${iconClass}`);

					break;
				case "custom-class":
					action.icon.split(" ").forEach((className) => el.classList.add(className));

					break;
				default:
					iconEl.classList.add("material-icons");
					iconEl.textContent = action.icon;
			}
		}

		if (typeof _options.iconPack === "object") {
			const iconClasses = _options.iconPack?.classes ?? ["material-icons"];
			iconClasses.forEach((iconClass) => iconEl.classList.add(iconClass));

			if (_options.iconPack.textContent) {
				iconEl.textContent = action.icon;
			}
		}

		el.appendChild(iconEl);
	}

	if (action.class) {
		const actionClasses = Array.isArray(action.class) ? action.class : action.class.split(" ");
		actionClasses.forEach((className) => el.classList.add(className.trim()));
	}

	// initiate push with ready
	if (action.push) {
		el.addEventListener("click", (e) => {
			e.preventDefault();

			// check if vue router passed through global options
			if (!_options.router) {
				console.warn("[vue-toasted] : Vue Router instance is not attached. please check the docs");
				return;
			}

			_options.router.push(action.push);

			// fade away toast after action.
			if (!action.push.dontClose) {
				toastObject.goAway(0);
			}
		});
	}

	if (typeof action.onClick === "function") {
		el.addEventListener("click", (e) => {
			e.preventDefault();
			action.onClick(e, toastObject);
		});
	}

	return el;
};

/**
 * this method will create the toast
 */
export const show = function (
	instance: Toasted,
	message: string | HTMLElement,
	options: Record<string, any>
): ToastObject {
	// share the instance across
	_instance = instance;

	options = new ToastOptions(options);
	const container = _instance.container;

	options.containerClass = ["toasted-container", ...options.containerClass];

	// check if the container classes has changed if so update it
	if (container.className !== options.containerClass.join(" ")) {
		container.className = "";
		options.containerClass.forEach((className) => container.classList.add(className));
	}

	// Select and append toast
	const newToast = createToast(message, options);

	// only append toast if message is not undefined
	if (message) {
		container.appendChild(newToast);
	}

	newToast.style.opacity = "0";

	// Animate toast in
	animations.animateIn(newToast);

	// Allows timer to be pause while being panned
	let timeLeft = options.duration;
	let counterInterval;
	if (timeLeft !== null) {
		const createInterval = () => {
			setInterval(() => {
				if (newToast.parentNode === null) window.clearInterval(counterInterval);

				// If toast is not being dragged, decrease its time remaining
				if (!newToast.classList.contains("panning")) {
					timeLeft -= 20;
				}

				if (timeLeft <= 0) {
					// Animate toast out
					animations.animateOut(newToast, function () {
						// Call the optional callback
						if (typeof options.onComplete === "function") options.onComplete();
						// Remove toast after it times out
						if (newToast.parentNode) {
							_instance.remove(newToast);
						}
					});

					window.clearInterval(counterInterval);
				}
			}, 20);
		};

		counterInterval = createInterval();

		// Toggle interval on hover
		if (options.keepOnHover) {
			newToast.addEventListener("mouseover", () => window.clearInterval(counterInterval));
			newToast.addEventListener("mouseout", () => (counterInterval = createInterval()));
		}
	}

	return new ToastObject(newToast, _instance);
};
