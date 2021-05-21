import { ToastNotification, ToastOptions, UserToastOptions } from "./show";
import animations from "./animations";
import uuid from "shortid";

export type ToastElement = HTMLDivElement & { hash?: string };
export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
export type ToastType = "success" | "info" | "error" | "default";
export type ToastTheme = "primary" | "outline" | "bubble";
export type ToastIconPack = "material" | "fontawesome" | "custom-class" | "callback";
export type ToastIconPackObject = {
	iconPack?: ToastIconPack;
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
	userOptions: UserToastOptions = {};
	cachedOptions: Record<string, any> = {};
	defaultOptions: UserToastOptions = {
		position: "top-right",
		theme: "primary",
		type: "default",
		iconPack: "material",
	};
	global: Record<string, (payload: ToastOptions & Record<string, any>, options: ToastOptions) => ToastNotification> =
		{};
	toasts: ToastNotification[] = [];
	container: HTMLElement = null;
	configurations: Record<string, UserToastOptions> = {
		show: {},
		info: { type: "info" },
		success: { type: "success" },
		error: { type: "error" },
	};

	constructor(options: UserToastOptions) {
		this.id = uuid.generate();
		this.userOptions = options;
		this.options = new ToastOptions(options);

		this.initializeToastContainer();
		this.initializeCustomToasts();

		// Merge default configurations with default options and instance options
		// Object.keys(this.configurations).forEach((x) => {
		// 	this.configurations[x] = { ...this.defaultOptions, ...this.userOptions, ...this.configurations[x] };
		// });

		// Merge default configurations with user options
		// Add user configurations
		const configs = this.options?.configurations ?? {};
		Object.keys(configs).forEach((x) => {
			this.configurations[x] = {
				...this.configurations?.[x],
				...configs[x],
			};
		});
	}

	register(name: string, payload: ToastRegistrationPayload = null, options: UserToastOptions = {}) {
		return this.registerToast(name, payload, options);
	}

	notify(id: string, message: string, options: UserToastOptions = {}) {
		const config = this.configurations?.[id] ?? {};
		return this.showToast(
			message,
			new ToastOptions({ ...this.defaultOptions, ...this.userOptions, ...config, ...options })
		);
	}

	setConfiguration(id: string, options: UserToastOptions = {}, extend: boolean = true) {
		if (extend) this.configurations[id] = { ...this.configurations[id], ...options };
		else this.configurations[id] = { ...options };

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

	registerToast(name: string, callback: ToastRegistrationPayload = null, options: UserToastOptions = {}) {
		this.options.globalToasts[name] = function (payload, showToast, toastOptions = {}) {
			const message = typeof callback === "function" ? callback(payload) : payload ?? callback;

			return showToast(message, { ...options, ...toastOptions });
		};

		this.initializeCustomToasts();
	}

	initializeCustomToasts() {
		const showToast = (message: string | HTMLElement, options: string | ToastOptions = {}) => {
			if (typeof options === "string") {
				return this[options](message, {});
			}

			return this.showToast(message, options);
		};

		this.global = {};
		Object.keys(this.options.globalToasts).forEach((name) => {
			this.global[name] = (payload = {}, options = {}) => {
				return this.options.globalToasts[name](payload, showToast, options);
			};
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
