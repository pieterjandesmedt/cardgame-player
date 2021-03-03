<template>
	<div class="scene">
		<div
			class="box is-shadowless image is-relative card-scene"
			:class="`${card.ratio || 'is-3by4'}${card.isFaceUp ? '' : ' is-flipped'}`"
		>
			<div class="box-card m-2">
				<div v-if="card.isFaceUp" class="front-of-card is-flex-direction-column is-flex">
					<zone v-for="zone in card.zones" :key="zone.id" :zone="zone" :value="zone.value"></zone>
				</div>
				<div v-else class="back-of-card is-flex" :style="cardBackStyle">
					<div class="deck-name" :style="textStyle">{{ card.deckName || 'Deck' }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Zone from './Zone.vue';

function parseHexColor(color) {
	return color
		? [
				parseInt(color.replace('#', '').substr(0, 2), 16) / 255.0,
				parseInt(color.replace('#', '').substr(2, 2), 16) / 255.0,
				parseInt(color.replace('#', '').substr(4, 2), 16) / 255.0,
		  ]
		: [0, 0, 0];
}

export default {
	components: { Zone },
	props: ['card'],
	computed: {
		textStyle() {
			return `color: ${this.textColor(this.card.deckColor)}`;
		},
		cardBackStyle() {
			return `border-color: ${this.card.deckColor}; background-color: ${this.opacity(this.card.deckColor, 0.9)}`;
		},
	},
	methods: {
		textColor(bgColor) {
			if (!bgColor) {
				return '';
			}
			const colors = parseHexColor(bgColor);
			const adjusted = colors.map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
			return 0.2126 * adjusted[0] + 0.7152 * adjusted[1] + 0.0722 * adjusted[2] > 0.179 ? '#000' : '#fff';
		},
		opacity(color, op = 1) {
			return `rgba(${parseHexColor(color)
				.map(c => c * 255)
				.join()}, ${op})`;
		},
	},
};
</script>

<style lang="scss">
.deck-name {
	font-size: 120%;
	font-weight: bold;
	opacity: 0.7;
	width: 100%;
	text-align: center;
	white-space: pre-line;
}

.box {
	border: 1px solid lightgrey;
	transition: transform 200ms;
	transform-style: preserve-3d;
}

.box-card {
	width: calc(100% - 1em);
	height: calc(100% - 1em);
	position: absolute;
	top: 0;
	left: 0;
	&.m-2 {
		margin: 0.5em !important;
	}
}

.front-of-card {
	height: 100%;
	backface-visibility: hidden;
}

.back-of-card {
	height: 100%;
	align-items: center;
	border-radius: 0.25em;
	transform: rotateY(180deg);
}

.card-scene {
	perspective: 600px;
}

.box.is-flipped {
	transform: rotateY(180deg);
}
</style>
