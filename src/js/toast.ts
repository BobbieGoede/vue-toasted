import { show } from "./show";
import animations from "./animations";
import uuid from "shortid";
import { IToasted, IToastObject, ToastElement, ToastOptions } from "src/types";

/**
 * Toast
 * core instance of toast
 *
 * @param _options
 * @returns {Toasted}
 * @constructor
 */
export class Toasted implements IToasted {
	/**
	 * Unique id of the toast
	 */
	id: string;
	/**
	 * Shared Options of the Toast
	 */
	options: Record<string, any> = {};
	/**
	 * Cached Options of the Toast
	 */
	cached_options: Record<string, any> = {};
	/**
	 * Shared Toasts list
	 */
	global: Record<string, any> = {};
	/**
	 * All Registered Groups
	 */
	groups: Toasted[] = [];
	/**
	 * All Registered Toasts
	 */
	toasts: IToastObject[] = [];
	/**
	 * Element of the Toast Container
	 */
	container: HTMLElement = null;

	constructor(_options: Record<string, any>) {
		this.id = uuid.generate();
		this.options = _options;

		/**
		 * Initiate toast container
		 */
		initiateToastContainer(this);

		/**
		 * Initiate custom toasts
		 */
		initiateCustomToasts(this);
	}

	/**
	 * Create New Group of Toasts
	 *
	 * @param o
	 */
	group = (o) => {
		if (!o) o = {};

		if (!o.globalToasts) {
			o.globalToasts = {};
		}

		// share parents global toasts
		o.globalToasts = { ...o.globalToasts, ...this.global };

		// tell parent about the group
		let group = new Toasted(o);
		this.groups.push(group);

		return group;
	};

	/**
	 * Register a Global Toast
	 *
	 * @param name
	 * @param payload
	 * @param options
	 */
	register = (name, payload, options) => {
		options = { ...options };
		return register(this, name, payload, options);
	};

	/**
	 * Show a Simple Toast
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	show = (message: string, options: Record<string, any>) => {
		if (this.options.customNotifications && this.options.customNotifications.show != null) {
			options = { ...options, ...this.options.customNotifications.show };
		}
		return _show(this, message, options);
	};

	/**
	 * Show a Toast with Success Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	success = (message: string, options: Record<string, any>) => {
		options = { ...options, type: "success" };
		if (this.options.customNotifications && this.options.customNotifications.success != null) {
			options = { ...options, ...this.options.customNotifications.success };
		}
		return _show(this, message, options);
	};

	/**
	 * Show a Toast with Info Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	info = (message: string, options: Record<string, any>) => {
		options = { ...options, type: "info" };
		if (this.options.customNotifications && this.options.customNotifications.info != null) {
			options = { ...options, ...this.options.customNotifications.info };
		}
		return _show(this, message, options);
	};

	/**
	 * Show a Toast with Error Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	error = (message: string, options: Record<string, any>) => {
		options = { ...options, type: "error" };
		if (this.options.customNotifications && this.options.customNotifications.error != null) {
			options = { ...options, ...this.options.customNotifications.error };
		}
		return _show(this, message, options);
	};

	/**
	 * Remove a Toast
	 * @param el
	 */
	remove = (el: ToastElement) => {
		this.toasts = this.toasts.filter((t) => t.el.hash !== el.hash);
		if (el.parentNode) el.parentNode.removeChild(el);
	};

	/**
	 * Clear All Toasts
	 *
	 * @returns {boolean}
	 */
	clear = (onClear) => {
		animations.clearAnimation(this.toasts, () => {
			onClear && onClear();
		});
		this.toasts = [];

		return true;
	};
}

/**
 * Wrapper for show method in order to manipulate options
 *
 * @param instance
 * @param message
 * @param options
 * @returns {*}
 * @private
 */
export const _show = function (instance: Toasted, message, options: Record<string, any>) {
	options = options || {};
	let toast = null;

	if (typeof options !== "object") {
		console.error("Options should be a type of object. given : " + options);
		return null;
	}

	// singleton feature
	if (instance.options.singleton && instance.toasts.length > 0) {
		instance.cached_options = options;
		instance.toasts[instance.toasts.length - 1].goAway(0);
	}

	// clone the global options
	// merge the cached global options with options
	const _options = { ...instance.options, ...options };

	toast = show(instance, message, _options);
	instance.toasts.push(toast);

	return toast;
};

/**
 * Register the Custom Toasts
 */
export const initiateCustomToasts = function (instance) {
	const customToasts = instance.options.globalToasts;

	// this will initiate toast for the custom toast.
	const initiate = (message, options) => {
		// check if passed option is a available method if so call it.
		if (typeof options === "string" && instance[options]) {
			return instance[options].apply(instance, [message, {}]);
		}

		// or else create a new toast with passed options.
		return _show(instance, message, options);
	};

	if (customToasts) {
		instance.global = {};

		Object.keys(customToasts).forEach((key) => {
			// register the custom toast events to the Toast.custom property
			instance.global[key] = (payload = {}) => {
				// return the it in order to expose the Toast methods
				return customToasts[key].apply(null, [payload, initiate]);
			};
		});
	}
};

const initiateToastContainer = function (instance) {
	// create notification container
	const container = document.createElement("div");
	container.id = instance.id;
	container.setAttribute("role", "status");
	container.setAttribute("aria-live", "polite");
	container.setAttribute("aria-atomic", "false");

	document.body.appendChild(container);
	instance.container = container;
};

const register = function (instance, name, callback, options) {
	!instance.options.globalToasts ? (instance.options.globalToasts = {}) : null;

	instance.options.globalToasts[name] = function (payload, initiate) {
		// if call back is string we will keep it that way..
		if (typeof callback === "string") {
			return initiate(callback, options);
		}

		if (typeof callback === "function") {
			return initiate(callback(payload), options);
		}
	};

	initiateCustomToasts(instance);
};
