import { Manager, Pan } from "@egjs/hammerjs";
import animations from "./animations";
import uuid from "shortid";
import {
	IToastAction,
	ToastElement,
	IToastOptions,
	ToastPosition,
	ToastIconPack,
	ToastIconPackObject,
	IToastObject,
} from "../types";
import { Toasted } from "./toast";

class ToastOptions implements IToastOptions {
	onComplete = null;
	position: ToastPosition = "top-right";
	duration = null;
	keepOnHover = false;
	theme = "primary";
	type = "default";
	containerClass: string[] = [];
	icon = null;
	action = null;
	closeOnSwipe = true;
	iconPack: string | ToastIconPack | ToastIconPackObject = "material";
	className: string[] = [];
	router: any = null;

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

		if (this.theme) this.className.push(`toasted--${this.theme.trim()}`);
		if (this.type) this.className.push(this.type);

		if (this.position) this.containerClass.push(this.position.trim());
		if (o.fullWidth) this.containerClass.push("full-width");
		if (o.fitToScreen) this.containerClass.push("fit-to-screen");
	}
}

export class ToastNotification implements IToastObject {
	el: ToastElement;
	instance: Toasted = null;
	options: ToastOptions = null;
	hammerHandler: HammerManager = null;

	get container() {
		return this.instance.container;
	}

	constructor(instance: Toasted, message: string | HTMLElement, options: Record<string, any>) {
		this.instance = instance;
		this.options = new ToastOptions(options);

		this.options.containerClass = ["toasted-container", ...this.options.containerClass];

		// check if the container classes has changed if so update it
		if (this.container.className !== this.options.containerClass.join(" ")) {
			this.container.className = "";
			this.options.containerClass.forEach((className) => this.container.classList.add(className));
		}

		// Select and append toast
		this.el = this.createElement(message, this.options);

		// only append toast if message is not undefined
		if (message) {
			this.container.appendChild(this.el);
		}

		this.el.style.opacity = "0";

		// Animate toast in
		animations.animateIn(this.el);

		// Allows timer to be pause while being panned
		let timeLeft = this.options.duration;
		let counterInterval;
		if (timeLeft !== null) {
			const createInterval = () => {
				setInterval(() => {
					if (this.el.parentNode === null) window.clearInterval(counterInterval);

					// If toast is not being dragged, decrease its time remaining
					if (!this.el.classList.contains("panning")) {
						timeLeft -= 20;
					}

					if (timeLeft <= 0) {
						// Animate toast out
						animations.animateOut(this.el, () => {
							this.options.onComplete?.();
							this.remove();
						});

						window.clearInterval(counterInterval);
					}
				}, 20);
			};

			counterInterval = createInterval();

			// Toggle interval on hover
			if (this.options.keepOnHover) {
				this.el.addEventListener("mouseover", () => window.clearInterval(counterInterval));
				this.el.addEventListener("mouseout", () => (counterInterval = createInterval()));
			}
		}
	}

	text(text: string | Node = "") {
		if (text instanceof Node) this.el.appendChild(text);
		if (typeof text === "string") this.el.innerHTML = text;

		return this;
	}

	goAway(delay = 800) {
		// Animate toast out
		setTimeout(() => {
			// if the toast is on bottom set it as bottom animation
			if (this.instance.cachedOptions?.position?.includes("bottom")) {
				animations.animateOutBottom(this.el, () => this.remove());
				return;
			}

			animations.animateOut(this.el, () => this.remove());
		}, delay);

		return true;
	}

	remove() {
		this.hammerHandler.destroy();
		this.instance.remove(this.el);
	}

	createElement(html: HTMLElement | string, options: IToastOptions): ToastElement {
		const toastElement: ToastElement = document.createElement("div");
		toastElement.classList.add("toasted");
		toastElement.hash = uuid.generate();

		if (options.className && Array.isArray(options.className)) {
			options.className.forEach((className) => toastElement.classList.add(className));
		}

		if (html instanceof HTMLElement) {
			toastElement.appendChild(html);
		} else {
			const messageElement = document.createElement("span");
			messageElement.classList.add("toasted-message");
			messageElement.innerHTML = html;
			toastElement.appendChild(messageElement);
		}

		if (options.icon) {
			const icon = this.createIcon(options);

			if (typeof options.icon === "object" && options.icon.after) {
				toastElement.appendChild(icon);
			} else {
				toastElement.insertBefore(icon, toastElement.firstChild);
			}
		}

		if (options.closeOnSwipe) {
			this.hammerHandler = new Manager(toastElement, { domEvents: true, recognizers: [[Pan]] });
			const activationDistance = 80;

			this.hammerHandler.on("pan", (e) => {
				toastElement.classList.add("panning");

				const opacityPercent = Math.max(1 - Math.abs(e.deltaX / activationDistance), 0);
				animations.animatePanning(toastElement, e.deltaX, opacityPercent);
			});

			this.hammerHandler.on("panend", (e) => {
				// If toast dragged past activation point
				if (Math.abs(e.deltaX) > activationDistance) {
					animations.animatePanEnd(toastElement, () => {
						options?.onComplete?.();
						this.remove();
					});
				} else {
					toastElement.classList.remove("panning");
					animations.animateReset(toastElement);
				}
			});
		}

		// create and append actions
		if (options.action) {
			options.action = Array.isArray(options.action) ? options.action : [options.action];
			options.action.forEach((action) => {
				const el = this.createAction(action, this);
				if (el) toastElement.appendChild(el);
			});
		}

		return toastElement;
	}

	createIcon(options) {
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
	}

	createAction(action: IToastAction, toastObject: IToastObject) {
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

			if (typeof this.options.iconPack === "string") {
				const iconClass = action.icon.trim();

				switch (this.options.iconPack) {
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

			if (typeof this.options.iconPack === "object") {
				const iconClasses = this.options.iconPack?.classes ?? ["material-icons"];
				iconClasses.forEach((iconClass) => iconEl.classList.add(iconClass));

				if (this.options.iconPack.textContent) {
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
				if (!this.options.router) {
					console.warn("[vue-toasted] : Vue Router instance is not attached. please check the docs");
					return;
				}
				console.log(this.options);

				this.options.router.push(action.push);

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
	}
}
