import { PluginFunction } from "vue";

export type ToastElement = HTMLDivElement & { hash?: string };
export interface IToastObject {
	// html element of the toast
	el: ToastElement;
	// change text or html of the toast
	text(text: string | Node): any;
	// fadeAway the toast. default delay will be 800ms
	goAway(delay?: number): any;

	remove(): void;
	disposed(): boolean;
}

export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
export type ToastType = "success" | "info" | "error" | "default";
export type ToastTheme = "primary" | "outline" | "bubble";
export type ToastIconPack = "material" | "fontawesome" | "custom-class" | "callback";
export type ToastIconPackObject = {
	classes?: string[];
	textContent?: boolean;
};

export interface IToastAction {
	/**
	 * name of action
	 */
	text: string;
	/**
	 * url of action
	 */
	href?: string;
	/**
	 * name of material for action
	 */
	icon?: string;
	/**
	 * custom css class for the action
	 */
	class?: string | string[];
	/**
	 * Vue Router push parameters
	 */
	push?: any;
	/**
	 * onClick Function of action
	 *
	 * @param e
	 * @param {ToastObject} toastObject
	 * @returns {any}
	 */
	onClick?: (e: any, toastObject: IToastObject) => any;
}

export interface IToastOptions {
	id?: string;
	/**
	 * Position of the toast container (default: 'top-right')
	 */
	position?: ToastPosition;
	/**
	 * Display time of the toast in millisecond
	 */
	duration?: number;

	keepOnHover?: boolean;
	configurations?: Record<string, IToastOptions>;
	/**
	 * Add single or multiple actions to toast explained here
	 */
	action?: IToastAction | IToastAction[];
	/**
	 * Enable Full Width
	 */
	fullWidth?: boolean;
	/**
	 * Fits to Screen on Full Width
	 */
	fitToScreen?: boolean;
	/**
	 * Custom css class name of the toast
	 */
	className?: string | string[];
	/**
	 * Custom css classes for toast container
	 */
	containerClass?: string | string[];
	/**
	 * Material icon name as string
	 */
	icon?: string | { name: string; after: boolean };
	/**
	 * Type of the Toast ['success', 'info', 'error']. (default: 'default')
	 */
	type?: ToastType | string;
	/**
	 * Theme of the toast you prefer (default: 'primary')
	 */
	theme?: ToastTheme | string;
	/**
	 * Trigger when toast is completed
	 */
	onComplete?: () => any;
	/**
	 * Closes the toast when the user swipes it (default: true)
	 */
	closeOnSwipe?: boolean;
	/**
	 * Only allows one toast at a time.
	 */
	singleton?: boolean;
	/**
	 * Icon pack type to be used
	 */
	iconPack?: ToastIconPackObject | ToastIconPack | string;
	router?: any;
	customNotifications?: Record<"show" | "success" | "info" | "error", any>;
	globalToasts?: Record<string, (payload, initiate) => IToasted>;
}

export interface IToasted {
	id: string;
	options: IToastOptions;
	cachedOptions: IToastOptions;
	global: Record<string, any>;
	globalToasts: Record<string, IToasted>;
	groups: IToasted[];
	toasts: IToastObject[];
	container: HTMLElement;

	/**
	 * Show a toast with success style
	 *
	 * @param message
	 * @param options
	 */
	show(message: string, options?: IToastOptions): IToastObject;

	/**
	 * Show a toast with success style
	 * @param message
	 * @param options
	 */
	success(message: string, options?: IToastOptions): IToastObject;

	/**
	 * Show a toast with info style
	 *
	 * @param message
	 * @param options
	 */
	info(message: string, options?: IToastOptions): IToastObject;

	/**
	 * Show a toast with error style
	 *
	 * @param message
	 * @param options
	 */
	error(message: string, options?: IToastOptions): IToastObject;

	/**
	 * register your own toast with options explained here
	 *
	 * @param name
	 * @param message
	 * @param options
	 */
	register(name: string, message: string | ((payload: any) => string), options?: IToastOptions): void;

	/**
	 * Clear all toasts
	 */
	clear(onClear?: () => void): boolean;
	remove(el: ToastElement): void;
	group(o): IToasted;
}

declare class ToastedPlugin {
	static install: PluginFunction<IToastOptions>;
}

declare module "vue/types/vue" {
	interface VueConstructor {
		toasted: IToasted;
	}

	interface Vue {
		$toasted: IToasted;
	}
}

export default ToastedPlugin;
