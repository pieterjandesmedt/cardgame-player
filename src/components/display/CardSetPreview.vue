<template>
	<div class="card-set-preview">
		<h3 class="is-size-4" v-if="numberOfCards > 0">Card set preview</h3>
		<div class="columns is-multiline">
			<div
				class="column  is-half-tablet is-one-third-desktop is-one-quarter-widescreen is-one-fifth-fullhd"
				v-for="c in numberOfCards"
				:key="c"
			>
				<card :zones="currentZonesWithValues" :values="values()[c - 1]"></card>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { flatten, xprod } from 'ramda';
import Card from './Card.vue';

function multiply(p = 1, c = 1) {
	return p * c;
}

function flattenIfNeeded(item) {
	if (typeof item === 'string') return [item];
	return flatten(item);
}

export default {
	components: { Card },
	computed: {
		...mapGetters(['currentCardSet', 'currentZonesWithValues', 'currentValues']),
		numberOfCards() {
			return this.currentZonesWithValues && this.currentZonesWithValues.length > 0
				? this.currentZonesWithValues.map(z => z.values.split(',').filter(n => n).length).reduce(multiply, 1)
				: 0;
		},
	},
	methods: {
		...mapActions(['addCardsToDeck', 'updateCardsInDeck']),
		values() {
			return this.currentZonesWithValues
				.map(zone => zone.values.split(',').filter(n => n))
				.reduce(xprod)
				.map(flattenIfNeeded);
		},
	},
};
</script>
