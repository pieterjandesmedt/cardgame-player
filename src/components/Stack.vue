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
				{{ stack.name || 'Deck' }} {{ isTable ? 'on the table' : 'in your hand' }}
				<small class="has-size-7 has-text-weight-light"
					>{{ stack.cards.length }} card{{ stack.cards.length === 1 ? '' : 's' }}</small
				>
			</h4>
			<b-tooltip type="is-danger" class="mt-1 is-pulled-right" label="Delete stack">
				<button class="delete" @click="deleteStack(stack.id)"></button>
			</b-tooltip>
			<div class="buttons has-addons mb-0 mr-2" v-if="hasACard">
				<b-tooltip label="Take in your hand" v-if="isTable">
					<b-button icon-left="hand-right" @click="takeStackInHand(stack.id)" type="is-small"> </b-button>
				</b-tooltip>
				<b-tooltip label="Put on the table" v-else>
					<b-button icon-left="table-furniture" @click="putStackOnTable(stack.id)" type="is-small">
					</b-button>
				</b-tooltip>
			</div>
			<div class="buttons has-addons mr-2 mb-0" v-if="hasMultipleCards">
				<b-tooltip label="Cut stack">
					<b-button
						icon-left="content-cut"
						@click="toggleCutOptions"
						:type="isShowingCutOptions ? 'is-primary is-small' : 'is-small'"
					>
					</b-button>
				</b-tooltip>
				<b-tooltip label="Shuffle stack">
					<b-button icon-left="shuffle-variant" @click="handleShuffle" type="is-small"> </b-button>
				</b-tooltip>
			</div>
			<div class="buttons has-addons mb-0 mr-2" v-if="hasACard">
				<b-tooltip label="Show all cards" v-if="hasSomeCardsFaceDown">
					<b-button icon-left="eye" @click="showAllCards(stack)" type="is-small"> </b-button>
				</b-tooltip>
				<b-tooltip label="Hide all cards" v-if="hasAllCardsFaceUp">
					<b-button icon-left="eye-off" @click="hideAllCards(stack)" type="is-small"> </b-button>
				</b-tooltip>
				<b-tooltip label="Toggle stack display">
					<b-button
						icon-left="layers-triple-outline"
						@click="toggleDisplayMode"
						type="is-small"
						v-if="hasMultipleCards"
					>
					</b-button>
				</b-tooltip>
				<b-tooltip label="Minimize">
					<b-button icon-left="magnify-minus-outline" @click="toggleMinimized" type="is-small"> </b-button>
				</b-tooltip>
			</div>
			<div class="buttons has-addons mb-0">
				<b-button class="button is-small is-transparent" icon-left="arrow-all" style="cursor:grab"></b-button>
			</div>
			<b-field v-if="isShowingCutOptions" class="mb-2">
				<p class="control">
					<b-button size="is-small" type="is-primary" @click="cut(stack.id)">Cut into</b-button>
				</p>
				<form @submit.prevent="cut">
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
		isTable: {
			required: false,
			default: false,
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
			'takeStackInHand',
			'putStackOnTable',
		]),
		async handleShuffle() {
			await this.shuffleStack(this.stack);
			const el = this.$el;
			el.querySelectorAll('.cardcont').forEach((element, index) => {
				const deg = Math.round(Math.random() * 6) - 3;
				const x = index === 0 ? 300 : Math.round(Math.random() * 60) - 30 + (index % 2 === 0 ? 350 : 0);
				const y = Math.round(Math.random() * 60) - 30;
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
		cut() {
			this.cutStack({
				id: this.stack.id,
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
			const size = this.stack.cards[index].size;
			const rotation = {
				stacked: 0,
				spread: 5,
				free: 0,
			}[this.displayMode];
			const margin = {
				stacked: `calc(2px - ${size + 0.5}em)`,
				spread: `${1.7 - size}em`,
				free: 0,
			}[this.displayMode];
			const rotateZ =
				((index - Math.floor(this.stack.cards.length / 2)) / (this.stack.cards.length || 1)) * rotation;
			return {
				'z-index': this.stack.cards.length - index,
				transform: `rotateZ(${rotateZ}deg)`,
				transition: 'transform  150ms ease-in-out, margin 150ms ease-in-out',
				'margin-left': index ? margin : 0,
				'margin-right': '0.5em',
				width: `${size}em`,
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
	min-height: 180px;
	padding: 10px 2px 20px 10px;
	border: 1px dashed gray;
	border-radius: 8px;
	position: relative;
}
.cardcont {
	display: inline-block;
	position: relative;
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
