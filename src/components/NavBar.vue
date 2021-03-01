<template>
	<div class="buttons">
		<b-tooltip label="Leave game" position="is-bottom">
			<button class="button is-danger mr-2" @click="leave">
				<b-icon icon="arrow-left"></b-icon>
			</button>
		</b-tooltip>
		<upload></upload>
		<b-tooltip label="Create empty stack" position="is-bottom">
			<button class="button is-transparent mr-2" @click="createStack(undefined)">
				<b-icon icon="plus"></b-icon>
			</button>
		</b-tooltip>
		<!-- <b-tooltip label="Undo" position="is-bottom">
			<button class="button mr-2" @click="undo">
				<b-icon icon="undo"></b-icon>
			</button>
		</b-tooltip> -->
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import Upload from './Upload';

export default {
	components: { Upload },
	methods: {
		...mapActions(['createStack', 'leaveGame', 'undo']),
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
