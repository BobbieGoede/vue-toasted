import { ToastNotification } from "./show";
import animations from "./animations";
import uuid from "shortid";
import { IToasted, IToastObject, ToastElement, IToastOptions } from "../types";

/**
 * Toast
 * core instance of toast
 */
export class Toasted implements IToasted {
	id: string;
	options: IToastOptions = {};
	cachedOptions: Record<string, any> = {};
	global: Record<string, (payload: IToastOptions) => IToastObject> = {};
	toasts: IToastObject[] = [];
	container: HTMLElement = null;
	configurations: Record<string, IToastOptions> = {
		show: {},
		info: { type: "info" },
		success: { type: "success" },
		error: { type: "error" },
	};

	constructor(options: IToastOptions) {
		this.id = uuid.generate();
		this.options = options;

		this.initializeToastContainer();
		this.initializeCustomToasts();

		const configs = this.options?.configurations ?? {};
		Object.keys(configs).forEach((x) => {
			this.configurations[x] = { ...this.configurations?.[x], ...configs[x] };
		});
	}

	register(name: string, payload: any, options: IToastOptions = {}) {
		return this.registerToast(name, payload, options);
	}

	notify(id: string, message: string, options: IToastOptions = {}) {
		const config = this.configurations?.[id] ?? {};
		return this.showToast(message, { ...config, ...options });
	}

	setConfiguration(id: string, options: IToastOptions = {}) {
		this.configurations[id] = { ...options };

		return this.configurations[id];
	}

	show(message: string, options: IToastOptions = {}) {
		return this.notify("show", message, options);
	}

	success(message: string, options: IToastOptions = {}) {
		return this.notify("success", message, options);
	}

	info(message: string, options: IToastOptions = {}) {
		return this.notify("info", message, options);
	}

	error(message: string, options: IToastOptions = {}) {
		return this.notify("error", message, options);
	}

	remove(el: ToastElement) {
		this.toasts = this.toasts.filter((t) => t.el.hash !== el.hash);

		if (el.parentNode) {
			el.parentNode.removeChild(el);
		}
	}

	/* Clear All Toasts */
	clear(onClear: () => any) {
		animations.clearAnimation(this.toasts, () => onClear && onClear());
		this.toasts = [];

		return true;
	}

	showToast(message: string | HTMLElement, options: IToastOptions = {}) {
		// singleton feature
		if (this.options.singleton && this.toasts.length > 0) {
			this.cachedOptions = options;
			this.toasts[this.toasts.length - 1].goAway(0);
		}

		// clone and merge the the global options with options
		const toast = new ToastNotification(this, message, { ...this.options, ...options });
		this.toasts.push(toast);

		return toast;
	}

	registerToast(name: string, callback: (arg0: any) => any, options: IToastOptions) {
		this.options.globalToasts ??= {};
		this.options.globalToasts[name] = function (payload, initiate) {
			// if callback is a string we will keep it that way..
			if (typeof callback === "string") {
				return initiate(callback, options);
			}

			if (typeof callback === "function") {
				return initiate(callback(payload), options);
			}
		};

		this.initializeCustomToasts();
	}

	initializeCustomToasts() {
		const customToasts = this.options.globalToasts;

		// this will initiate toast for the custom toast.
		const initiate = (message: string | HTMLElement, options: string | IToastOptions) => {
			// Use default notification function to display toast
			if (typeof options === "string") {
				if (["success", "info", "error"].includes(options)) {
					return this[options](message, {});
				}
			} else {
				// or else create a new toast with passed options.
				return this.showToast(message, options);
			}
		};

		if (customToasts) {
			this.global = {};

			const customToastNames = Object.keys(customToasts);
			customToastNames.forEach((name) => {
				// register the custom toast events to the Toast.custom property
				this.global[name] = (payload: IToastOptions = {}): IToastObject => {
					// return the it in order to expose the Toast methods
					// return customToasts[key].apply(null, [payload, initiate]);
					return customToasts[name](payload, initiate);
				};
			});
		}
	}

	initializeToastContainer() {
		const container = document.createElement("div");
		container.id = this.id;
		container.setAttribute("role", "status");
		container.setAttribute("aria-live", "polite");
		container.setAttribute("aria-atomic", "false");

		document.body.appendChild(container);
		this.container = container;
	}
}
