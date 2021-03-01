<template>
	<div class="buttons">
		<button class="button is-danger" @click="leave">
			<b-icon icon="arrow-left"></b-icon>
		</button>
		<upload></upload>
		<button class="button is-transparent" @click="createStack(undefined)">
			<b-icon icon="plus"></b-icon>
		</button>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import Upload from './Upload';

export default {
	components: { Upload },
	methods: {
		...mapActions(['createStack', 'leaveGame']),
		async leave() {
			await this.leaveGame();
			this.$router.push('/lobby');
		},
	},
};
</script>

<style lang="scss">
.button.is-transparent {
	background-color: transparent !important;
	border: 1px dashed gray;
}
</style>
