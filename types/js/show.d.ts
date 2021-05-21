import { ToastAction, Toasted, ToastElement, ToastIconPack, ToastIconPackObject, ToastPosition } from "./toast";
export declare type UserToastOptions = {
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
    globalToasts?: Record<string, (payload: any, initiate: any) => ToastNotification>;
    fullWidth?: boolean;
    fitToScreen?: boolean;
};
declare type IconOptions = {
    name?: string;
    after?: boolean;
};
export declare class ToastOptions {
    onComplete?: () => void;
    position?: ToastPosition;
    duration?: number;
    keepOnHover?: boolean;
    theme?: string;
    type?: string;
    containerClass?: string[];
    icon?: IconOptions;
    action?: ToastAction[];
    closeOnSwipe?: boolean;
    iconPack?: string | ToastIconPack | ToastIconPackObject;
    className?: string[];
    router?: any;
    configurations?: Record<string, ToastOptions>;
    singleton?: boolean;
    globalToasts?: Record<string, (payload: any, initiate: any, toastOptions?: ToastOptions) => ToastNotification>;
    constructor(o: UserToastOptions);
}
export declare class ToastNotification {
    el: ToastElement;
    instance: Toasted;
    options: ToastOptions;
    hammerHandler: HammerManager;
    isPanning: boolean;
    get container(): HTMLElement;
    constructor(instance: Toasted, message: string | HTMLElement, options: Record<string, any>);
    text(text?: string | Node): this;
    goAway(delay?: number): boolean;
    remove(): void;
    createElement(html: HTMLElement | string, options: ToastOptions): ToastElement;
    createIcon(options: ToastOptions): HTMLElement;
    createAction(action: ToastAction, toastObject: ToastNotification): HTMLAnchorElement | HTMLButtonElement;
}
export {};
//# sourceMappingURL=show.d.ts.map