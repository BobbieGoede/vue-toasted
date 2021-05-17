import Vue from "vue";
// import VueToasted from "../";
var Toasted = require("../dist/vue-toasted").default;
import Index from "./index.vue";

Vue.use(Toasted);

new Vue({
	el: "#app",
	render: (h) => h(Index),
});
