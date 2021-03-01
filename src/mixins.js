import { mapActions } from 'vuex';

const dropHandler = {
	methods: {
		...mapActions(['moveCardBetweenStacks', 'giveCardToPlayer', 'giveStackToPlayer', 'mergeStacks']),
		handleDrop(drop) {
			const from = drop.relatedTarget.attributes;
			const to = drop.target.attributes;

			const fromStackId = from['data-stack-id']?.value;
			const toStackId = to['data-stack-id']?.value;
			const toPlayerId = to['data-player-id']?.value;
			const cardId = from['data-card-id']?.value;

			if (cardId) {
				if (fromStackId === toStackId) {
					// It's just a move of card to the same stack
					console.log(`It's just a move of card to the same stack`);
					drop.relatedTarget.style.webkitTransform = null;
					drop.relatedTarget.style.transform = null;
					drop.relatedTarget.removeAttribute('data-x');
					drop.relatedTarget.removeAttribute('data-y');
				} else if (!toStackId && toPlayerId) {
					// Giving a card to another player
					console.log('Giving a card to another player');
					this.giveCardToPlayer({ fromStackId, toStackId, cardId, toPlayerId });
				} else if (toStackId && !toPlayerId) {
					// A card needs to move from one stack to the other
					console.log('A card needs to move from one stack to the other');
					this.moveCardBetweenStacks({ fromStackId, toStackId, cardId, toPlayerId });
				}
			} else {
				if (fromStackId === toStackId) {
					// It's just a move of a stack
					console.log(`It's just a move of a stack`);
					return;
				} else if (!toStackId && toPlayerId) {
					// Giving a stack to another player
					console.log('Giving a stack to another player');
					this.giveStackToPlayer({ fromStackId, toStackId, cardId, toPlayerId });
				} else if (toStackId && !toPlayerId) {
					// Merging two stacks
					console.log('Merging two stacks');
					this.mergeStacks({ fromStackId, toStackId, cardId, toPlayerId });
				}
			}
		},
	},
};

export { dropHandler };
