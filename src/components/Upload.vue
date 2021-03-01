<template>
	<b-upload v-model="file" class="file-label" accept="application/json" @input="uploadDeck">
		<a class="button">
			<b-icon icon="cards-outline"></b-icon>
		</a>
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
