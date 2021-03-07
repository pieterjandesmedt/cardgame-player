<template>
	<div class="buttons">
		<b-tooltip label="Leave game" position="is-bottom">
			<button class="button is-danger mr-2" @click="leave">
				<b-icon icon="arrow-left"></b-icon>
			</button>
		</b-tooltip>
		<upload></upload>
		<b-tooltip label="Order stacks" position="is-bottom">
			<button class="button mr-2" @click="orderStacks">
				<b-icon icon="apps"></b-icon>
			</button>
		</b-tooltip>
		<b-tooltip label="Set dice" position="is-bottom">
			<button class="button mr-2" @click="toggleDiceSelector">
				<b-icon icon="dice-6"></b-icon>
			</button>
		</b-tooltip>
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
		<b-modal v-model="isDieSelectorActive" :width="640" scroll="keep">
			<die-selector @close="toggleDiceSelector"></die-selector>
		</b-modal>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import Upload from './Upload';
import { EventBus } from './event-bus';
import DieSelector from '@/components/DieSelector.vue';

export default {
	components: { Upload, DieSelector },
	data() {
		return {
			isDieSelectorActive: false,
		};
	},
	methods: {
		...mapActions(['createStack', 'leaveGame', 'undo']),
		async leave() {
			await this.leaveGame();
			this.$router.push('/lobby');
		},
		orderStacks() {
			EventBus.$emit('order-stacks');
		},
		toggleDiceSelector() {
			this.isDieSelectorActive = !this.isDieSelectorActive;
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
