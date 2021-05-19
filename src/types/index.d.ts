import Toasted from "src/index-core";
import { PluginFunction } from "vue";
import { ToastOptions } from "../js/show";

declare class ToastedPlugin {
	static install: PluginFunction<ToastOptions>;
}

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
		toasted: Toasted;
	}

	interface NuxtAppOptions {
		$toasted: Toasted;
	}

	interface Configuration {
		toasted?: ToastOptions;
	}
}

export default ToastedPlugin;
