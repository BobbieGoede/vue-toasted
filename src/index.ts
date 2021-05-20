/// <reference path="../modules/vue.d.ts" />
/// <reference path="../modules/shims-vue.d.ts" />
/// <reference path="../modules/window.d.ts" />

import { Toasted } from "./js/toast";
import ToastComponent from "./toast.vue";
import { ToastOptions } from "./js/show";
import { PluginObject } from "vue/types/umd";

const ToastedPlugin: PluginObject<ToastOptions> = {
	install(Vue, options) {
		options = { ...options };

		const Toast = new Toasted(options);
		Vue.component("toasted", ToastComponent);
		Vue.toasted = Vue.prototype.$toasted = Toast;
		// Vue.toasts = Vue.prototype.$toasts = (id, message, options) => Toast.notify(id, message, options);
		// Vue.config.globalProperties.$toasted = Toast;
	},
};

// register plugin if it is used via cdn or directly as a script tag
if (typeof window !== "undefined" && window.Vue) {
	window.Toasted = ToastedPlugin;
}

export default ToastedPlugin;
