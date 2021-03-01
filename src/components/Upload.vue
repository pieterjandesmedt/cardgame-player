<template>
	<b-upload v-model="file" accept="application/json" @input="uploadDeck">
		<b-tooltip label="Upload deck" position="is-bottom">
			<a class="button mr-2">
				<b-icon icon="cards-outline"></b-icon>
			</a>
		</b-tooltip>
	</b-upload>
</template>

<script>
import { mapActions } from 'vuex';

export default {
	data() {
		return {
			file: null,
		};
	},
	methods: {
		...mapActions(['createStack']),
		uploadDeck(file) {
			const reader = new FileReader();

			reader.onload = e => {
				const newStack = JSON.parse(e.target.result);
				if (newStack.cards && Array.isArray(newStack.cards) && newStack.cards.length > 0) {
					this.createStack(newStack);
				}
			};

			reader.readAsText(file);
		},
	},
};
</script>
