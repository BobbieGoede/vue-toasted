import { ToastNotification, ToastOptions, UserToastOptions } from "./show";
import animations from "./animations";
import uuid from "shortid";

export type ToastElement = HTMLDivElement & { hash?: string };
export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
export type ToastType = "success" | "info" | "error" | "default";
export type ToastTheme = "primary" | "outline" | "bubble";
export type ToastIconPack = "material" | "fontawesome" | "custom-class" | "callback";
export type ToastIconPackObject = {
	classes?: string[];
	textContent?: boolean;
};
export type ToastRegistrationPayload = string | ((arg: string) => string);

export interface ToastAction {
	text: string;
	href?: string;
	icon?: string;
	class?: string | string[];
	push?: any;
	onClick?: (e: any, toastObject: ToastNotification) => any;
}

/**
 * Toast
 * core instance of toast
 */
export class Toasted {
	id: string;
	options: ToastOptions = {};
	cachedOptions: Record<string, any> = {};
	global: Record<string, (payload: ToastOptions) => ToastNotification> = {};
	toasts: ToastNotification[] = [];
	container: HTMLElement = null;
	configurations: Record<string, ToastOptions> = {
		show: {},
		info: { type: "info" },
		success: { type: "success" },
		error: { type: "error" },
	};

	constructor(options: UserToastOptions) {
		this.id = uuid.generate();
		this.options = new ToastOptions(options);

		this.initializeToastContainer();
		this.initializeCustomToasts();

		const configs = this.options?.configurations ?? {};
		Object.keys(configs).forEach((x) => {
			this.configurations[x] = { ...this.configurations?.[x], ...configs[x] };
		});
	}

	register(name: string, payload: ToastRegistrationPayload = null, options: UserToastOptions = {}) {
		return this.registerToast(name, payload, options);
	}

	notify(id: string, message: string, options: UserToastOptions = {}) {
		const config = this.configurations?.[id] ?? {};
		return this.showToast(message, new ToastOptions({ ...config, ...options }));
	}

	setConfiguration(id: string, options: UserToastOptions = {}, extend: boolean = true) {
		this.configurations[id] = { ...(extend ? this.configurations[id] : {}), ...options };
		return this.configurations[id];
	}

	show(message: string, options: UserToastOptions = {}) {
		return this.notify("show", message, options);
	}

	success(message: string, options: UserToastOptions = {}) {
		return this.notify("success", message, options);
	}

	info(message: string, options: UserToastOptions = {}) {
		return this.notify("info", message, options);
	}

	error(message: string, options: UserToastOptions = {}) {
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

	registerToast(name: string, callback: ToastRegistrationPayload = null, options: ToastOptions = {}) {
		this.options.globalToasts[name] = function (payload, initiate) {
			const message = typeof callback === "function" ? callback(payload) : payload ?? callback;

			return initiate(message, options);
		};

		this.initializeCustomToasts();
	}

	initializeCustomToasts() {
		// this will initiate toast for the custom toast.
		const initiate = (message: string | HTMLElement, options: string | ToastOptions = {}) => {
			if (typeof options === "string") {
				return this[options](message, {});
			}

			return this.showToast(message, options);
		};

		this.global = {};
		Object.keys(this.options.globalToasts).forEach((name) => {
			this.global[name] = (payload = {}): ToastNotification => this.options.globalToasts[name](payload, initiate);
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
