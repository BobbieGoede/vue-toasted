import Toasted from "../src/index-core";

declare module "vue/types/vue" {
	interface VueConstructor {
		toasted: Toasted;
	}

	interface Vue {
		$toasted: Toasted;
	}
}

// Nuxt 2.9+
declare module "@nuxt/types" {
	interface Context {
		$toast: Toasted;
	}
	interface NuxtAppOptions {
		$toast: Toasted;
	}
}

declare module "vue/types/vue" {
	interface Vue {
		$toast: Toasted;
	}
}

declare module "vuex/types/index" {
	interface Store<S> {
		$toast: Toasted;
	}
}
