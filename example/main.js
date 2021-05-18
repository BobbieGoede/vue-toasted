import Vue from "vue";
import Toasted from "../src/index";
import Index from "./index.vue";

Vue.use(Toasted, { position: "top-right" });

new Vue({
	el: "#app",
	render: (h) => h(Index),
});
