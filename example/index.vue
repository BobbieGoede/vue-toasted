<template>
	<div id="app">
		<div v-for="toast of logs" :key="toast.buttonText">
			<button @click="$toasted.notify(toast.type, toast.toastMessage, toast.toastOptions)">
				{{ toast.buttonText }}
			</button>
		</div>
		<button @click="$toasted.clear()">Clear all</button>
		<div class="toast-builder">
			<h3>Build your toast</h3>
			<div class="toast-builder__form">
				<label>
					<span>Type</span>
					<select v-model="customToast.type">
						<option value="">default</option>
						<option :value="option" :key="option" v-for="option of toastTypes">{{ option }}</option>
					</select>
				</label>
				<label>
					<span>Message</span>
					<input type="text" v-model="customToast.message" />
				</label>
				<label>
					<span>Duration (ms)</span>
					<input type="number" v-model="customToast.options.duration" />
				</label>
				<label>
					<span>Icon</span>
					<input type="text" v-model="customToast.options.icon" />
				</label>
				<label>
					<span>Position</span>
					<select v-model="customToast.options.position">
						<option :value="option" :key="option" v-for="option of positionOptions">{{ option }}</option>
					</select>
				</label>
				<label class="action-input">
					<span>Actions</span>
					<div class="action-input__elements">
						<input type="text" v-model="customAction" />
						<button @click="addAction" :disabled="!customAction">
							<span class="material-icons">add</span>
						</button>
					</div>
					<div class="action-entries">
						<div v-for="(action, i) of customToast.options.action" :key="action.text" class="action-entry">
							{{ action.text }}
							<span class="material-icons" @click="removeAction(i)">remove</span>
						</div>
					</div>
				</label>
			</div>
			<div>
				<button @click="$toasted.notify(customToast.type, customToast.message, customToast.options)">
					Toast
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			customToast: {
				type: "info",
				message: "Hello world!",
				options: {
					icon: "sentiment_very_satisfied",
					duration: 4000,
					position: "top-center",
					action: [{ text: "Test", onClick: () => {} }],
				},
			},
			customAction: "",
			positionOptions: ["top-right", "top-center", "top-left", "bottom-right", "bottom-center", "bottom-left"],
			toastTypes: ["info", "success", "error"],
			logs: [
				{
					type: "show",
					buttonText: "Show toast",
					toastMessage: "This is a default toast",
					toastOptions: {
						action: [{ onClick: () => console.log("hi"), text: "Action", icon: "download" }],
					},
				},
				{
					type: "info",
					buttonText: "Info toast",
					toastMessage: "This is an info toast",
					toastOptions: {
						action: [{ onClick: () => console.log("hi"), text: "Action" }],
						icon: "info",
					},
				},
				{
					type: "error",
					buttonText: "Error toast",
					toastMessage: "Error toast testing!",
					toastOptions: {
						action: [{ onClick: () => console.log("hi"), text: "Action" }],
						icon: "error",
					},
				},
				{
					type: "success",
					buttonText: "Success toast",
					toastMessage: "Test completed.",
					toastOptions: {
						action: [{ onClick: () => console.log("hi"), text: "Action" }],
						icon: "check_circle",
					},
				},
			],
		};
	},
	methods: {
		addAction() {
			this.customToast.options.action.push({
				text: this.customAction,
				onClick: () => {},
			});

			this.customAction = "";
		},
		removeAction(actionIndex) {
			this.customToast.options.action = this.customToast.options.action.filter((x, i) => i !== actionIndex);
		},
	},
};
</script>

<style lang="scss">
body {
	font-family: "Roboto";
}

.action-input {
	&__elements {
		display: flex;
		input {
			flex: 4 0;
		}
		button {
			padding: initial;
			flex: 1 0;
		}
		.material-icons {
			font-size: 1em !important;
		}
	}
	.action-entries {
		margin-top: 0.5rem;
	}
}

.action-entry {
	display: flex;
	align-items: center;
	justify-content: space-between;
	// line-height: 100%;
	padding: 0.25rem 0.5rem;
	background-color: #eee;
	border-radius: 4px;
	width: 100%;
	font-size: 13px;
	text-transform: uppercase;
	box-sizing: border-box;
	// width: 200px;
	span {
		cursor: pointer;
	}
}
.toast-builder {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	width: 600px;

	&__form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-flow: row dense;
		gap: 1rem;
	}

	input,
	select,
	button {
		padding: 0.25rem 0.5rem;
		width: 100%;
	}

	label {
		& > span {
			color: #666;
			display: block;
			// margin-top: 1rem;
			margin-bottom: 0.5rem;
			font-size: 13px;
		}
	}
}
</style>
