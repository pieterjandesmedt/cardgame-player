<template>
	<interact
		:class="isMinimized ? 'minimized stack dropable' : 'maximised stack dropable'"
		:data-stack-id="stack.id"
		:resizableOpt="resizableOpt"
		:doubletap="isMinimized"
		@doubletap="toggleMinimized"
	>
		<div v-if="!isMinimized">
			<b-field v-if="isEditingName" class="mb-1">
				<form @submit.prevent="handleUpdateStackName">
					<b-input size="is-small" :value="stack.name" v-model="newName"></b-input>
				</form>
				<p class="control">
					<b-button size="is-small" type="is-primary" @click="handleUpdateStackName">Rename</b-button>
				</p>
			</b-field>
			<h4 v-else class="has-text-weight-bold mb-0 has-cursor-text" @click="isEditingName = true">
				{{ stack.name || 'Deck' }} {{ stack.id }}
				<small class="has-size-7 has-text-weight-light"
					>{{ stack.cards.length }} card{{ stack.cards.length === 1 ? '' : 's' }}</small
				>
			</h4>
			<button class="delete is-pulled-right mt-1" @click="deleteStack(stack.id)"></button>
			<div class="buttons has-addons mr-2 mb-0" v-if="hasMultipleCards">
				<b-button
					icon-left="content-cut"
					@click="toggleCutOptions"
					:type="isShowingCutOptions ? 'is-primary is-small' : 'is-small'"
				>
				</b-button>
				<b-button icon-left="shuffle-variant" @click="handleShuffle" type="is-small"> </b-button>
			</div>
			<div class="buttons has-addons mb-0 mr-2" v-if="hasACard">
				<b-button icon-left="eye" @click="showAllCards(stack)" type="is-small" v-if="hasSomeCardsFaceDown">
				</b-button>
				<b-button icon-left="eye-off" @click="hideAllCards(stack)" type="is-small" v-if="hasAllCardsFaceUp">
				</b-button>
				<b-button
					icon-left="layers-triple-outline"
					@click="toggleDisplayMode"
					type="is-small"
					v-if="hasMultipleCards"
				>
				</b-button>
				<b-button icon-left="magnify-minus-outline" @click="toggleMinimized" type="is-small"> </b-button>
			</div>
			<div class="buttons has-addons mb-0">
				<b-button class="button is-small is-transparent" icon-left="arrow-all" style="cursor:grab"></b-button>
			</div>
			<b-field v-if="isShowingCutOptions" class="mb-2">
				<p class="control">
					<b-button size="is-small" type="is-primary" @click="cut(stack.id)">Cut into</b-button>
				</p>
				<form @submit.prevent="cut(stack.id)">
					<b-input
						size="is-small"
						type="number"
						placeholder="Cut into"
						min="2"
						:max="stack.cards.length"
						v-model="cutValue"
					></b-input>
				</form>
			</b-field>
		</div>
		<dropzone
			@drop="handleDrop"
			:data-stack-id="stack.id"
			class="inner pb-1"
			:class="`dropzone-${stack.id}`"
			:style="minimizedStyle(stack.cards)"
		>
			<div v-if="!isMinimized">
				<interact
					v-for="(card, index) in stack.cards"
					:key="card.id"
					class="cardcont stacked dropable"
					:data-stack-id="stack.id"
					:data-card-id="card.id"
					:doubletap="true"
					@doubletap="handleFlipCard"
					:style="stackStyle(index)"
					:resizableOpt="resizableOpt"
				>
					<card :card="card"></card>
				</interact>
			</div>
		</dropzone>
	</interact>
</template>

<script>
import { mapActions } from 'vuex';
import Dropzone from './Interact/Dropzone.vue';
import Interact from './Interact/Interact.vue';
import Card from './display/Card.vue';
import { dropHandler } from '@/mixins';

const displayModes = ['stacked', 'spread', 'free'];

export default {
	components: {
		Dropzone,
		Interact,
		Card,
	},
	props: {
		stack: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			isMinimized: false,
			displayMode: 'spread',
			isShowingCutOptions: false,
			isEditingName: false,
			newName: 'Deck',
			cutValue: 2,
			resizableOpt: {
				inertia: true,
				restrictEdges: {
					outer: 'parent',
					endOnly: true,
				},
				edges: {
					left: false,
					right: false,
					bottom: false,
					top: false,
				},
				preserveAspectRatio: false,
			},
		};
	},
	mixins: [dropHandler],
	computed: {
		hasACard() {
			return this.stack.cards.length > 0;
		},
		hasMultipleCards() {
			return this.stack.cards.length > 1;
		},
		hasSomeCardsFaceUp() {
			return this.stack.cards.map(c => c.isFaceUp).reduce((p, c) => p || c, 0);
		},
		hasSomeCardsFaceDown() {
			return this.stack.cards.map(c => !c.isFaceUp).reduce((p, c) => p || c, 0);
		},
		hasAllCardsFaceUp() {
			return this.stack.cards.map(c => c.isFaceUp).reduce((p, c) => p && c, 1);
		},
		hasAllCardsFaceDown() {
			return this.stack.cards.map(c => !c.isFaceUp).reduce((p, c) => p && c, 1);
		},
	},
	methods: {
		...mapActions([
			'shuffleStack',
			'cutStack',
			'deleteStack',
			'flipCard',
			'showAllCards',
			'hideAllCards',
			'updateStack',
		]),
		handleShuffle() {
			this.shuffleStack(this.stack);
			const el = this.$el;
			if (this.stack.isStacked) {
				el.querySelectorAll('.cardcont').forEach((element, index) => {
					const deg = Math.round(Math.random() * 6) - 3;
					const x = Math.round(Math.random() * 6) - 3 + (index % 2 === 0 ? 350 : 0);
					const y = Math.round(Math.random() * 6) - 3;
					element.animate(
						[
							{ transform: 'rotate(0deg) translate(0px, 0px)' },
							{ transform: `rotate(${deg}deg) translate(${x}px, ${y}px)` },
							{ transform: 'rotate(0deg) translate(0px, 0px)' },
						],
						{
							duration: 400,
							iterations: 1,
							delay: index * 10,
						},
					);
				});
			}
		},
		toggleMinimized() {
			this.isMinimized = !this.isMinimized;
		},
		toggleDisplayMode() {
			this.displayMode =
				displayModes[(displayModes.findIndex(dm => dm === this.displayMode) + 1) % displayModes.length];
		},
		toggleCutOptions() {
			this.isShowingCutOptions = !this.isShowingCutOptions;
		},
		cut(stackId) {
			this.cutStack({
				id: stackId,
				into: this.cutValue,
			});
		},
		remove() {
			this.deleteStack({
				stack: {
					id: this.stack.id,
				},
			});
		},
		handleUpdateStackName() {
			this.updateStack(Object.assign({}, this.stack, { name: this.newName }));
			this.isEditingName = false;
		},
		handleFlipCard(doubletap) {
			const card = doubletap.attributes;
			const cardId = card['data-card-id']?.value;
			const fromStackId = card['data-stack-id']?.value;
			if (cardId && fromStackId) this.flipCard({ cardId, fromStackId });
		},
		stackStyle(index) {
			const slider = {
				stacked: 0,
				spread: 20,
				free: 130,
			}[this.displayMode];
			// 0 => 0,
			// 20 => 20,
			// >=40 => 0
			const sliderToTriangle = Math.max(0, 20 - Math.abs(20 - slider));
			const rotateZ =
				(((index - Math.floor(this.stack.cards.length / 2)) / (this.stack.cards.length || 1)) *
					sliderToTriangle) /
				4;
			return {
				'z-index': this.stack.cards.length - index,
				transform: `rotateZ(${rotateZ}deg)`,
				'margin-left': index ? `calc(-200px - 8px + ${slider / 10}em)` : 0,
				transition: 'margin 100ms',
			};
		},
		minimizedStyle(cards) {
			return {
				'background-color': this.isMinimized && cards && cards.length > 0 ? cards[0].deckColor : 'transparent',
			};
		},
	},
};
</script>

<style scoped lang="scss">
.buttons {
	display: inline-block;
}
.minimized {
	.dropzone {
		min-width: 0;
		min-height: 0;
		width: 60px;
		height: 80px;
		border: 3px solid white;
		border-radius: 3px;
	}
}
.stack {
	margin: 0.75rem;
	display: inline-block;
}
.hidden {
	display: none;
}
.dropzone {
	display: inline-block;
	min-width: 180px;
	min-height: 240px;
	padding: 10px 2px 20px 10px;
	border: 1px dashed gray;
	border-radius: 8px;
	position: relative;
}
.cardcont {
	display: inline-block;
	min-width: 200px;
	position: relative;
	margin-right: 10px;
	/* will-change: transform; */
}
.stacked + .stacked {
	margin-left: calc(-200px - 10px + 2px);
	transition: margin-left 150ms ease-in-out;
}
.drop-target {
	border-color: white;
	box-shadow: 0 0 10px gold, 0 0 10px inset gold;
}
.bottom {
	text-align: right;
	position: absolute;
	padding: 18px 20px;
	bottom: 0;
	left: 0;
	width: calc(100% - 40px);
	border-top: 1px solid #e6ebf5;
}
.has-cursor-text {
	cursor: text;
}
</style>
<style>
.b-button {
	z-index: 1;
}
</style>
