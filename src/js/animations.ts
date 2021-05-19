import anime from "animejs/lib/anime.es.js";
import { ToastNotification } from "./show";

const duration = 166;

export default {
	animateIn(el) {
		anime({
			targets: el,
			translateY: "-32px",
			opacity: 1,
			duration: duration,
			easing: "easeOutCubic",
		});
	},
	animateOut(el, onComplete) {
		anime({
			targets: el,
			opacity: 0,
			marginTop: "-32px",
			duration: duration,
			easing: "easeOutExpo",
			complete: onComplete,
		});
	},
	animateOutBottom(el, onComplete) {
		anime({
			targets: el,
			opacity: 0,
			marginBottom: "-32px",
			duration: duration,
			easing: "easeOutExpo",
			complete: onComplete,
		});
	},
	animateReset(el) {
		anime({
			targets: el,
			left: 0,
			opacity: 1,
			duration: duration,
			easing: "easeOutExpo",
		});
	},
	animatePanning(el, left, opacity) {
		anime({
			targets: el,
			duration: 1,
			easing: "easeOutQuad",
			left: left,
			opacity: opacity,
		});
	},
	animatePanEnd(el, onComplete) {
		anime({
			targets: el,
			opacity: 0,
			duration: duration,
			easing: "easeOutExpo",
			complete: onComplete,
		});
	},
	clearAnimation(toasts: ToastNotification[], cb) {
		const timeline = anime.timeline();

		toasts.forEach((t) => {
			timeline.add({
				targets: t.el,
				opacity: 0,
				right: "-32px",
				duration: duration * 1.5,
				offset: "-=150",
				easing: "easeOutExpo",
				complete: () => {
					t.remove();
				},
			});
		});
	},
};
