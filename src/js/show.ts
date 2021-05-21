import { Manager, Pan } from "@egjs/hammerjs";
import animations from "./animations";
import uuid from "shortid";
import { ToastAction, Toasted, ToastElement, ToastIconPack, ToastIconPackObject, ToastPosition } from "./toast";

export type UserToastOptions = {
	onComplete?: () => void;
	position?: ToastPosition;
	duration?: number;
	keepOnHover?: boolean;
	theme?: string;
	type?: string;
	containerClass?: string | string[];
	icon?: string | IconOptions;
	action?: ToastAction | ToastAction[];
	closeOnSwipe?: boolean;
	iconPack?: string | ToastIconPack | ToastIconPackObject;
	className?: string | string[];
	router?: any;
	configurations?: Record<string, ToastOptions>;
	singleton?: boolean;
	globalToasts?: Record<string, (payload, initiate) => ToastNotification>;
	fullWidth?: boolean;
	fitToScreen?: boolean;
};

type IconOptions = {
	name?: string;
	after?: boolean;
};

export class ToastOptions {
	onComplete?: () => void = null;
	position?: ToastPosition = null;
	duration?: number = null;
	keepOnHover?: boolean = true;
	theme?: string = null;
	type?: string = null;
	containerClass?: string[] = ["toasted-container"];
	icon?: IconOptions = null;
	action?: ToastAction[] = [];
	closeOnSwipe? = true;
	iconPack?: string | ToastIconPack | ToastIconPackObject = null;
	className?: string[] = [];
	router?: any = null;
	configurations?: Record<string, ToastOptions> = {};
	singleton?: boolean = false;
	globalToasts?: Record<string, (payload, initiate, toastOptions?: ToastOptions) => ToastNotification> = {};

	constructor(o: UserToastOptions) {
		if (o.theme) this.theme = o.theme;
		if (o.type) this.type = o.type;
		if (o.position) this.position = o.position;
		if (o.iconPack) this.iconPack = o.iconPack;
		if (o.onComplete) this.onComplete = o.onComplete;
		if (o.duration) this.duration = o.duration;
		if (o.keepOnHover) this.keepOnHover = o.keepOnHover;
		if (o.icon) this.icon = typeof o.icon === "object" ? o.icon : { name: o.icon };
		if (o.action) this.action = Array.isArray(o.action) ? o.action : [o.action];
		if (o.closeOnSwipe) this.closeOnSwipe = o.closeOnSwipe;
		if (o.globalToasts) this.globalToasts = o.globalToasts;

		if (o.className) {
			const className = Array.isArray(o.className) ? o.className : o.className.split(" ");
			this.className.push(...className);
		}

		if (o.containerClass) {
			const containerClass = Array.isArray(o.containerClass) ? o.containerClass : o.containerClass.split(" ");
			this.containerClass.push(...containerClass);
		}

		if (o.configurations != null) {
			this.configurations = { ...this.configurations, ...o.configurations };
		}

		if (this.theme) this.className.push(`toasted--${this.theme.trim()}`);
		else this.className.push(`toasted--default`);
		if (this.type) this.className.push(`toasted--${this.type}`);
		if (this.position) this.containerClass.push(this.position.trim());

		if (o.fullWidth) this.containerClass.push("full-width");
		if (o.fitToScreen) this.containerClass.push("fit-to-screen");

		this.className = [...new Set(this.className)];
		this.containerClass = [...new Set(this.containerClass)];
	}
}

export class ToastNotification {
	el: ToastElement;
	instance: Toasted = null;
	options: ToastOptions = null;
	hammerHandler: HammerManager = null;
	isPanning = false;

	get container() {
		return this.instance.container;
	}

	constructor(instance: Toasted, message: string | HTMLElement, options: Record<string, any>) {
		this.instance = instance;
		this.options = new ToastOptions(options);

		// check if the container classes has changed if so update it
		if (this.container.className !== this.options.containerClass.join(" ")) {
			this.container.className = "";
			this.options.containerClass.forEach((className) => this.container.classList.add(className));
		}

		// Select and append toast
		this.el = this.createElement(message, this.options);
		this.el.style.opacity = "0";

		// only append toast if message is not undefined
		if (message) {
			this.container.appendChild(this.el);
		}

		// Animate toast in
		animations.animateIn(this.el);

		// Allows timer to be pause while being panned
		let timeLeft = this.options.duration;
		let counterInterval;
		if (timeLeft !== null) {
			const createInterval = () => {
				return setInterval(() => {
					if (this.el.parentNode === null) window.clearInterval(counterInterval);

					// If toast is not being dragged, decrease its time remaining
					if (!this.isPanning) {
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
		else this.el.innerHTML = text;

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

	createElement(html: HTMLElement | string, options: ToastOptions): ToastElement {
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
			messageElement.classList.add("toasted__message");
			messageElement.innerHTML = html;
			toastElement.appendChild(messageElement);
		}

		if (options.icon) {
			const icon = this.createIcon(options);

			toastElement.insertBefore(icon, options.icon.after ? toastElement.nextSibling : toastElement.firstChild);
		}

		if (options.closeOnSwipe) {
			this.hammerHandler = new Manager(toastElement, { domEvents: true, recognizers: [[Pan]] });
			const activationDistance = 80;

			this.hammerHandler.on("pan", (e) => {
				this.isPanning = true;

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
					this.isPanning = false;
					animations.animateReset(toastElement);
				}
			});
		}

		// create and append actions
		if (options.action) {
			options.action.forEach((action) => {
				const el = this.createAction(action, this);
				if (el) toastElement.appendChild(el);
			});
		}

		return toastElement;
	}

	createIcon(options: ToastOptions) {
		let iconEl = document.createElement("i");
		iconEl.setAttribute("aria-hidden", "true");
		iconEl.classList.add("toasted__icon");

		if (typeof options.iconPack === "string") {
			let iconClass = options.icon.name.trim();

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
					const classArray = Array.isArray(iconClass) ? iconClass : iconClass.split(" ");
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
					iconEl.textContent = options.icon.name;
			}
		}

		if (typeof options.iconPack === "object") {
			const iconClasses = options.iconPack?.classes ?? ["material-icons"];
			iconClasses.forEach((iconClass) => iconEl.classList.add(iconClass));

			if (options.iconPack?.textContent) {
				iconEl.textContent = options.icon.name;
			}
		}

		if (options.icon.after) {
			iconEl.classList.add("after");
		}

		return iconEl;
	}

	createAction(action: ToastAction, toastObject: ToastNotification) {
		const el = document.createElement(action.href ? "a" : "button");

		el.classList.add("toasted__action");

		if (el instanceof HTMLButtonElement) {
			if (action.text) el.textContent = action.text;
		}

		if (el instanceof HTMLAnchorElement) {
			if (action.text) el.text = action.text;
			if (action.href) el.href = action.href;
		}

		if (action.icon) {
			el.classList.add("icon");
			const iconEl = document.createElement("i");
			iconEl.classList.add("toasted__icon");

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

				if (this.options.iconPack?.textContent) {
					iconEl.textContent = action.icon;
				}
			}

			el.prepend(iconEl);
		}

		if (action.class) {
			const actionClasses = Array.isArray(action.class) ? action.class : action.class.split(" ");
			actionClasses.forEach((className) => el.classList.add(className.trim()));
		}

		if (action.push) {
			el.addEventListener("click", (e) => {
				e.preventDefault();

				// check if vue router passed through global options
				if (!this.options.router) {
					console.warn("[vue-toasted] : Vue Router instance is not attached. please check the docs");
					return;
				}

				this.options.router.push(action.push);
				toastObject.goAway(0);
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
