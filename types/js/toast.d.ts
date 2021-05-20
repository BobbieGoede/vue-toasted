import { ToastNotification, ToastOptions, UserToastOptions } from "./show";
export declare type ToastElement = HTMLDivElement & {
    hash?: string;
};
export declare type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
export declare type ToastType = "success" | "info" | "error" | "default";
export declare type ToastTheme = "primary" | "outline" | "bubble";
export declare type ToastIconPack = "material" | "fontawesome" | "custom-class" | "callback";
export declare type ToastIconPackObject = {
    classes?: string[];
    textContent?: boolean;
};
export declare type ToastRegistrationPayload = string | ((arg: string) => string);
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
export declare class Toasted {
    id: string;
    options: ToastOptions;
    cachedOptions: Record<string, any>;
    global: Record<string, (payload: ToastOptions) => ToastNotification>;
    toasts: ToastNotification[];
    container: HTMLElement;
    configurations: Record<string, ToastOptions>;
    constructor(options: UserToastOptions);
    register(name: string, payload?: ToastRegistrationPayload, options?: UserToastOptions): void;
    notify(id: string, message: string, options?: UserToastOptions): ToastNotification;
    setConfiguration(id: string, options?: UserToastOptions, extend?: boolean): ToastOptions;
    show(message: string, options?: UserToastOptions): ToastNotification;
    success(message: string, options?: UserToastOptions): ToastNotification;
    info(message: string, options?: UserToastOptions): ToastNotification;
    error(message: string, options?: UserToastOptions): ToastNotification;
    remove(el: ToastElement): void;
    clear(onClear: () => any): boolean;
    showToast(message: string | HTMLElement, options?: ToastOptions): ToastNotification;
    registerToast(name: string, callback?: ToastRegistrationPayload, options?: ToastOptions): void;
    initializeCustomToasts(): void;
    initializeToastContainer(): void;
}
//# sourceMappingURL=toast.d.ts.map