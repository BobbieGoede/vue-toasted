import { Toasted as T } from "./js/toast";
// @ts-ignore-next-line
import ToastComponent from "./toast.vue";

const Toasted = {
	install(Vue, options) {
		options = { ...options };

		const Toast = new T(options);
		Vue.component("toasted", ToastComponent);
		Vue.toasted = Vue.prototype.$toasted = Toast;
		Vue.toasts = Vue.prototype.$toasts = (id, message, options) => Toast.notify(id, message, options);
		// Vue.config.globalProperties.$toasted = Toast;
	},
};

// register plugin if it is used via cdn or directly as a script tag
if (typeof window !== "undefined" && window.Vue) {
	window.Toasted = Toasted;
}

export default Toasted;
