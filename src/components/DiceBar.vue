<template>
	<div>
		<span class="die-type" :class="index" v-for="(values, index) in diceBar" :key="index">
			<span v-if="values.length > 0">
				<span class="die" v-for="(value, i) in values" :key="`${index}-${i}`">
					<d2
						v-if="index === 'd2'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d2>
					<d4
						v-if="index === 'd4'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d4>
					<d6
						v-if="index === 'd6'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d6>
					<d8
						v-if="index === 'd8'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d8>
					<d10
						v-if="index === 'd10'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d10>
					<d20
						v-if="index === 'd20'"
						:class="{ 'is-rolling': isRolling(index, i) }"
						:value="value"
						@click.native="handleRollDie(index, i)"
					></d20>
				</span>
			</span>
		</span>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import D2 from '@/components/Dice/D2.vue';
import D4 from '@/components/Dice/D4.vue';
import D6 from '@/components/Dice/D6.vue';
import D8 from '@/components/Dice/D8.vue';
import D10 from '@/components/Dice/D10.vue';
import D20 from '@/components/Dice/D20.vue';
import { EventBus } from '@/components/event-bus.js';

export default {
	components: { D2, D4, D6, D8, D10, D20 },
	data() {
		return {
			currentlyRolling: [],
		};
	},
	computed: {
		...mapGetters(['diceBar']),
	},
	methods: {
		...mapActions(['rollDie']),
		handleRollDie(index, i) {
			this.rollDie({ dieType: index, dieIndex: i });
		},
		isRolling(dieType, dieIndex) {
			return this.currentlyRolling.includes(`${dieType}-${dieIndex}`);
		},
		animateDieRoll(payload) {
			this.currentlyRolling.push(`${payload.dieType}-${payload.dieIndex}`);
			const vm = this;
			setTimeout(() => {
				if (vm.currentlyRolling.length > 0) vm.currentlyRolling.splice(0, 1);
			}, 500);
		},
	},
	mounted() {
		EventBus.$on('roll-die', this.animateDieRoll);
	},
	beforeDestroy() {
		EventBus.$off('roll-die', this.animateDieRoll);
	},
};
</script>
