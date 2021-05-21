import Vue from "vue";
import Toasted from "../src/index";
import Index from "./index.vue";

Vue.use(Toasted, {
	position: "top-right",
	configurations: {
		success: {
			icon: "check_circle",
		},
	},
	globalToasts: {
		// have your toast name as propery name
		// it should accept 2 parameters 'payload' and 'initiate' callback
		// NOTE : you should return the initiate callback
		myCustomError: function (payload, initiate, options) {
			// have your logic here
			console.log(payload);
			if (payload.message) {
				return initiate(payload.message, { ...options, type: "error", theme: "primary" });
			}

			// initiate(Message/html, option/string)
			// error/show/success/info you can pass main function names or an option object
			return initiate("My Deepest Condolence", { ...options, type: "error", theme: "primary" });
		},
	},
});

const app = new Vue({
	el: "#app",
	render: (h) => h(Index),
});

window.app = app;
