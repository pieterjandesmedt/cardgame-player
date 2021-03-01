<template>
	<div class="deck-preview">
		<div class="deck-bar">
			<b-field>
				<b-input :value="deck.name" placeholder="Deck name" @input="updateDeckName"></b-input>
			</b-field>
			<b-field>
				<color-picker :value="deck.color" @input="updateDeckColor"></color-picker>
			</b-field>
			<b-field v-if="deck && deck.cardSets.map(c => c.zones.length).reduce((p, c) => p + c, 0) > 0">
				<download :data="toDownload()" :name="deckNameToSlug()">Download Deck</download>
			</b-field>
		</div>
		<div class="card-sets my-3">
			<b-notification
				class="card-set mr-1 p-0"
				v-for="cardSet in deck.cardSets.filter(c => numberOfCards(c) > 0)"
				:key="cardSet.id"
				@close="deleteCardSetFromDeck(cardSet.id)"
				@click.native="setEditingCardSetId(cardSet.id)"
			>
				<div
					class="card-container"
					v-for="c in numberOfCards(cardSet)"
					:key="c"
					:style="`z-index: ${numberOfCards(cardSet) + 1 - c}`"
				>
					<card :zones="currentZonesWithValues(cardSet)" :values="values(cardSet)[c - 1]"></card>
				</div>
			</b-notification>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { flatten, xprod, pick } from 'ramda';
import ColorPicker from '@/components/ColorPicker.vue';
import Card from './Card.vue';
import Download from './../Download.vue';

function flattenIfNeeded(item) {
	if (typeof item === 'string') return [item];
	return flatten(item);
}

/* eslint-disable */
function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}
/* eslint-enable */

export default {
	components: {
		Card,
		Download,
		ColorPicker,
	},
	props: ['deck'],
	computed: {
		...mapGetters(['currentCardSet']),
	},
	methods: {
		...mapActions([
			'setCardSet',
			'deleteCardSetFromDeck',
			'setEditingCardSetId',
			'updateDeckName',
			'updateDeckColor',
		]),
		numberOfCards(card) {
			return this.currentZonesWithValues(card) && this.currentZonesWithValues(card).length > 0
				? this.currentZonesWithValues(card)
						.map(z => z.values.split(',').filter(n => n).length)
						.reduce((p, c) => p * c, 1)
				: 0;
		},
		values(card) {
			return this.currentZonesWithValues(card)
				.map(zone => zone.values.split(',').filter(n => n))
				.reduce(xprod)
				.map(flattenIfNeeded);
		},
		currentZonesWithValues(card) {
			return card.zones.filter(z => z.values);
		},
		generateCards() {
			const allCards = [];
			let id = 0;
			this.deck.cardSets.forEach(card => {
				for (let index = 0; index < this.numberOfCards(card); index++) {
					const zoneValues = this.values(card)[index];
					const zones = this.currentZonesWithValues(card).map(pick(['text', 'color']));
					zones.forEach((zone, i) => {
						zone.value = zoneValues[i];
						if (!zone.text) delete zone.text;
					});
					const newCard = Object.assign({}, { id, zones: JSON.parse(JSON.stringify(zones)) });
					allCards.push(newCard);
					id++;
				}
			});
			return allCards;
		},
		deckNameToSlug() {
			return slugify(this.deck.name);
		},
		toDownload() {
			const cleanDeck = JSON.parse(JSON.stringify(this.deck));
			cleanDeck.cardSets = cleanDeck.cardSets.filter(c => this.numberOfCards(c) > 0);
			return {
				deck: cleanDeck,
				cards: this.generateCards(),
			};
		},
	},
};
</script>

<style>
.card-sets .notification .media {
	scale: 0.65;
}

.deck-preview .card-set {
	display: inline-block;
	cursor: pointer;
}

.deck-preview .card-container {
	width: 125px;
	position: relative;
	font-size: 60%;
	display: inline-block;
}

.deck-preview .card-container + .card-container {
	margin-left: calc(-125px + 2.2em);
}
</style>
