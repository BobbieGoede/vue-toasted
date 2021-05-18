import { ToastNotification, ToastOptions } from "./show";
import animations from "./animations";
import uuid from "shortid";
import { IToasted, IToastObject, ToastElement, IToastOptions } from "../types";

/**
 * Toast
 * core instance of toast
 */
export class Toasted implements IToasted {
	id: string;
	options: ToastOptions = {};
	cachedOptions: Record<string, any> = {};
	global: Record<string, (payload: ToastOptions) => IToastObject> = {};
	toasts: IToastObject[] = [];
	container: HTMLElement = null;
	configurations: Record<string, ToastOptions> = {
		show: {},
		info: { type: "info" },
		success: { type: "success" },
		error: { type: "error" },
	};

	constructor(options: IToastOptions) {
		this.id = uuid.generate();
		this.options = new ToastOptions(options);

		this.initializeToastContainer();
		this.initializeCustomToasts();

		const configs = this.options?.configurations ?? {};
		Object.keys(configs).forEach((x) => {
			this.configurations[x] = { ...this.configurations?.[x], ...configs[x] };
		});
	}

	register(name: string, payload: any, options: ToastOptions = {}) {
		return this.registerToast(name, payload, options);
	}

	notify(id: string, message: string, options: ToastOptions = {}) {
		const config = this.configurations?.[id] ?? {};
		return this.showToast(message, new ToastOptions({ ...config, ...options }));
	}

	setConfiguration(id: string, options: ToastOptions = {}, extend: boolean = true) {
		this.configurations[id] = { ...(extend ? this.configurations[id] : {}), ...options };
		return this.configurations[id];
	}

	show(message: string, options: ToastOptions = {}) {
		return this.notify("show", message, options);
	}

	success(message: string, options: ToastOptions = {}) {
		return this.notify("success", message, options);
	}

	info(message: string, options: ToastOptions = {}) {
		return this.notify("info", message, options);
	}

	error(message: string, options: ToastOptions = {}) {
		return this.notify("error", message, options);
	}

	remove(el: ToastElement) {
		this.toasts = this.toasts.filter((t) => t.el.hash !== el.hash);
		el.parentNode?.removeChild(el);
	}

	/* Clear All Toasts */
	clear(onClear: () => any) {
		animations.clearAnimation(this.toasts, () => onClear && onClear());
		this.toasts = [];

		return true;
	}

	showToast(message: string | HTMLElement, options: ToastOptions = {}) {
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

	registerToast(name: string, callback: (arg0: any) => any, options: ToastOptions) {
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
		// this will initiate toast for the custom toast.
		const initiate = (message: string | HTMLElement, options: string | ToastOptions) => {
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

		this.global = {};
		Object.keys(this.options.globalToasts).forEach((name) => {
			// register the custom toast events to the Toast.custom property
			this.global[name] = (payload = {}): IToastObject => this.options.globalToasts[name](payload, initiate);
		});
	}

	initializeToastContainer() {
		this.container = document.createElement("div");
		this.container.id = this.id;
		this.container.setAttribute("role", "status");
		this.container.setAttribute("aria-live", "polite");
		this.container.setAttribute("aria-atomic", "false");

		document.body.appendChild(this.container);
	}
}
