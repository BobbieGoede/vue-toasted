import { ToastAction, Toasted, ToastElement, ToastIconPack, ToastIconPackObject, ToastPosition } from "./toast";
export declare type UserToastOptions = Partial<ToastOptions> & {
    fullWidth?: boolean;
    fitToScreen?: boolean;
    className?: string | string[];
    containerClass?: string | string[];
};
export declare class ToastOptions {
    onComplete?: any;
    position?: ToastPosition;
    duration?: any;
    keepOnHover?: boolean;
    theme?: any;
    type?: any;
    containerClass?: string[];
    icon?: any;
    action?: any;
    closeOnSwipe?: boolean;
    iconPack?: string | ToastIconPack | ToastIconPackObject;
    className?: string[];
    router?: any;
    configurations?: Record<string, ToastOptions>;
    singleton?: boolean;
    globalToasts?: Record<string, (payload: any, initiate: any) => ToastNotification>;
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
    createIcon(options: any): HTMLElement;
    createAction(action: ToastAction, toastObject: ToastNotification): HTMLAnchorElement | HTMLButtonElement;
}
//# sourceMappingURL=show.d.ts.map