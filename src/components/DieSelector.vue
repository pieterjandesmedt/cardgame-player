<template>
	<div class="card">
		<div class="card-content">
			<div v-for="die in dice" :key="die.spotvalue">
				<b-field :label="die.name" class="mb-5">
					<b-icon :icon="die.icon" class="mt-2 mr-4"></b-icon>
					<b-slider
						:min="0"
						:max="maxDice"
						ticks
						:value="diceBar[die.type].length"
						@input="changeDiceBar($event, die.type)"
					>
					</b-slider>
				</b-field>
			</div>
		</div>
		<footer class="modal-card-foot is-flex is-justify-content-flex-end">
			<div class="buttons is-right">
				<button class="button" @click="close">Cancel</button>
				<button class="button is-primary" @click="handleSetDiceBar">Set dice</button>
			</div>
		</footer>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
	data() {
		return {
			maxDice: 10,
			newDiceBar: {
				d2: 0,
				// d4: 0,
				d6: 0,
				d8: 0,
				d10: 0,
				d20: 0,
			},
			dice: [
				{
					type: 'd2',
					name: 'Coin',
					spotvalue: 2,
					icon: 'bitcoin',
				},
				// {
				// 	type: 'd4',
				// 	name: '4 sided',
				// 	spotvalue: 4,
				// 	icon: 'dice-d4-outline',
				// },
				{
					type: 'd6',
					name: '6 sided',
					spotvalue: 6,
					icon: 'dice-d6-outline',
				},
				{
					type: 'd8',
					name: '8 sided',
					spotvalue: 8,
					icon: 'dice-d8-outline',
				},
				{
					type: 'd10',
					name: '10 sided',
					spotvalue: 10,
					icon: 'dice-d10-outline',
				},
				{
					type: 'd20',
					name: '20 sided',
					spotvalue: 20,
					icon: 'dice-d20-outline',
				},
			],
		};
	},
	computed: {
		...mapGetters(['diceBar']),
	},
	methods: {
		...mapActions(['setDiceBar']),
		close() {
			this.$emit('close');
		},
		handleSetDiceBar() {
			this.setDiceBar(this.newDiceBar);
			this.$emit('close');
		},
		changeDiceBar(value, dieType) {
			this.newDiceBar[dieType] = value;
		},
	},
	mounted() {
		console.log('diceBar:', this.diceBar);
	},
};
</script>
