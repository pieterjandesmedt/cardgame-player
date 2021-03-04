import cuid from 'cuid';
import { PlayerView } from 'boardgame.io/core';
import { Stage } from 'boardgame.io/core';

export const CardGame = {
	name: 'card-game',
	setup: ctx => {
		const game = {
			players: {},
			secret: { cards: {} },
		};
		for (let index = 0; index < ctx.numPlayers; index++) {
			game.players[index] = {
				stacks: [],
			};
			game.table = {
				stacks: [],
			};
		}
		ctx.events.setActivePlayers({ all: Stage.NULL });
		return game;
	},
	playerView: PlayerView.STRIP_SECRETS,
	moves: {
		createStack: (G, ctx, newStack) => {
			const owner = ctx.playerID;
			if (!newStack) newStack = { cards: [] };
			newStack.cards.forEach(card => {
				card.deckColor = card.deckColor || newStack.deck.color;
				card.deckName = card.deckName || newStack.deck.name;
				card.isFaceUp = card.isFaceUp || true;
				card.ratio = newStack.deck.ratio || 'is-3by4';
				card.size = newStack.deck.size || 16;
			});
			G.players[owner].stacks.push({
				id: cuid(),
				name: newStack.name,
				cards: newStack.cards,
			});
		},
		updateStack: (G, ctx, newStack) => {
			const owner = ctx.playerID;
			const playerStackIndex = G.players[owner].stacks.findIndex(stack => stack.id === newStack.id);
			const tableStackIndex = G.table.stacks.findIndex(stack => stack.id === newStack.id);
			if (playerStackIndex === -1 && tableStackIndex === -1)
				throw new Error(`Stack ${newStack.id} not found. Can't update.`);
			if (playerStackIndex !== -1) G.players[owner].stacks.splice(playerStackIndex, 1, newStack);
			if (tableStackIndex !== -1) G.table.stacks.splice(tableStackIndex, 1, newStack);
		},
		deleteStack: (G, ctx, id) => {
			const owner = ctx.playerID;
			const playerStackIndex = G.players[owner].stacks.findIndex(stack => stack.id === id);
			const tableStackIndex = G.table.stacks.findIndex(stack => stack.id === id);
			if (playerStackIndex === -1 && tableStackIndex === -1)
				throw new Error(`Stack ${id} not found. Can't delete.`);
			if (playerStackIndex !== -1) G.players[owner].stacks.splice(playerStackIndex, 1);
			if (tableStackIndex !== -1) G.table.stacks.splice(tableStackIndex, 1);
		},
		moveCardBetweenStacks: (G, ctx, { fromStackId, toStackId, cardId }) => {
			const owner = ctx.playerID;

			const fromStack =
				G.players[owner].stacks.find(stack => stack.id === fromStackId) ||
				G.table.stacks.find(stack => stack.id === fromStackId);
			const toStack =
				G.players[owner].stacks.find(stack => stack.id === toStackId) ||
				G.table.stacks.find(stack => stack.id === toStackId);
			if (!fromStack || !toStack)
				throw new Error(`One of the stacks was not found. Couldn't move card ${cardId}.`);

			const cardIndex = fromStack.cards.findIndex(card => `${card.id}` === `${cardId}`);
			if (cardIndex === -1)
				throw new Error(`Stack ${fromStackId} doesn't contain card ${cardId}. Can't move card ${cardId}.`);

			const [card] = fromStack.cards.splice(cardIndex, 1);
			toStack.cards.splice(0, 0, card);
		},
		shuffleStack: (G, ctx, payload) => {
			const owner = ctx.playerID;
			const stack =
				G.players[owner].stacks.find(stack => stack.id === payload.id) ||
				G.table.stacks.find(stack => stack.id === payload.id);
			if (stack) stack.cards.splice(0, stack.cards.length, ...shuffle(stack.cards));
		},
		cutStack: (G, ctx, payload) => {
			const owner = ctx.playerID;
			const playerStackIndex = G.players[owner].stacks.findIndex(stack => stack.id === payload.id);
			const tableStackIndex = G.table.stacks.findIndex(stack => stack.id === payload.id);
			if (playerStackIndex === -1 && tableStackIndex === -1)
				throw new Error(`Stack ${payload.id} not found. Can't cut.`);

			const [stack] =
				playerStackIndex !== -1
					? G.players[owner].stacks.splice(playerStackIndex, 1)
					: G.table.stacks.splice(tableStackIndex, 1);
			let into = 2;
			try {
				into = Math.min(Math.max(parseInt(payload.into, 10), 2), stack.cards.length);
			} catch (err) {
				console.log(`Error parsing 'into' value ${payload.into}:`, err);
				return;
			}
			const final = Array(into)
				.fill(Math.floor(stack.cards.length / into))
				.map((val, index) => (index < stack.cards.length % into ? val + 1 : val));

			let start = 0;
			const newStacks = [];
			final.forEach((value, index) => {
				const newStack = {
					id: cuid(),
					color: stack.color,
					name: `${stack.name || 'Deck'} ${index + 1}`,
					cards: stack.cards.slice(start, start + value),
				};
				newStacks.push(newStack);
				start += value;
			});
			if (playerStackIndex !== -1) G.players[owner].stacks.splice(playerStackIndex, 0, ...newStacks);
			else G.table.stacks.splice(tableStackIndex, 1, ...newStacks);
		},
		showAllCards: (G, ctx, payload) => {
			const owner = ctx.playerID;
			const stack =
				G.players[owner].stacks.find(stack => stack.id === payload.id) ||
				G.table.stacks.find(stack => stack.id === payload.id);
			if (stack) {
				stack.cards.forEach(c => {
					c.isFaceUp = true;
					if (G.secret && G.secret.cards[c.id].zones) c.zones = G.secret.cards[c.id].zones;
				});
			}
		},
		hideAllCards: (G, ctx, payload) => {
			const owner = ctx.playerID;
			const stack =
				G.players[owner].stacks.find(stack => stack.id === payload.id) ||
				G.table.stacks.find(stack => stack.id === payload.id);
			if (stack) {
				stack.cards.forEach(c => {
					c.isFaceUp = false;
					if (G.secret && c.zones) G.secret.cards[c.id] = { zones: c.zones };
					delete c.zones;
				});
			}
		},
		flipCard: (G, ctx, { fromStackId, cardId }) => {
			const owner = ctx.playerID;
			const stack =
				G.players[owner].stacks.find(stack => stack.id === fromStackId) ||
				G.table.stacks.find(stack => stack.id === fromStackId);
			if (!stack) throw new Error(`The stack ${fromStackId} was not found. Couldn't move card ${cardId}.`);

			const card = stack.cards.find(card => `${card.id}` === `${cardId}`);
			if (!card)
				throw new Error(`Stack ${fromStackId} doesn't contain card ${cardId}. Can't move card ${cardId}.`);

			if (card.isFaceUp) {
				card.isFaceUp = false;
				if (G.secret && card.zones) G.secret.cards[card.id] = { zones: card.zones };
				delete card.zones;
			} else {
				card.isFaceUp = true;
				if (G.secret && G.secret.cards[card.id].zones) card.zones = G.secret.cards[card.id].zones;
			}
		},
		giveCardToPlayer: (G, ctx, { fromStackId, cardId, toPlayerId }) => {
			if (toPlayerId !== 'table' && !G.players[toPlayerId]) return;
			const owner = ctx.playerID;
			const fromStack =
				G.players[owner].stacks.find(stack => stack.id === fromStackId) ||
				G.table.stacks.find(stack => stack.id === fromStackId);

			const hasToStack =
				toPlayerId === 'table'
					? G.table.stacks.find(stack => stack.name === 'Received')
					: G.players[toPlayerId].stacks.find(stack => stack.name === 'Received');
			if (!hasToStack) {
				const newStack = {
					id: cuid(),
					name: 'Received',
					cards: [],
				};
				if (toPlayerId === 'table') G.table.stacks.push(newStack);
				else G.players[toPlayerId].stacks.push(newStack);
			}
			const toStack =
				toPlayerId === 'table'
					? G.table.stacks.find(stack => stack.name === 'Received')
					: G.players[toPlayerId].stacks.find(stack => stack.name === 'Received');

			if (fromStack && toStack) {
				const cardIndex = fromStack.cards.findIndex(card => `${card.id}` === `${cardId}`);
				if (cardIndex === -1)
					throw new Error(`Stack ${fromStackId} doesn't contain card ${cardId}. Can't move card ${cardId}.`);

				const [card] = fromStack.cards.splice(cardIndex, 1);
				toStack.cards.splice(0, 0, card);
			} else {
				throw new Error(`One of the stacks was not found. Couldn't move card ${cardId}.`);
			}
		},
		giveStackToPlayer: (G, ctx, { fromStackId, toPlayerId }) => {
			if (toPlayerId !== 'table' && !G.players[toPlayerId]) return;
			const owner = ctx.playerID;
			const playerStackIndex = G.players[owner].stacks.findIndex(stack => stack.id === fromStackId);
			const tableStackIndex = G.table.stacks.findIndex(stack => stack.id === fromStackId);
			if (playerStackIndex === -1 && tableStackIndex === -1)
				throw new Error(`Stack ${fromStackId} not found. Can't give stack to ${toPlayerId}.`);

			if (playerStackIndex !== -1) {
				const [stack] = G.players[owner].stacks.splice(playerStackIndex, 1);
				if (toPlayerId === 'table') G.table.stacks.push(stack);
				else G.players[toPlayerId].stacks.push(stack);
			} else if (tableStackIndex !== -1) {
				const [stack] = G.table.stacks.splice(tableStackIndex, 1);
				if (toPlayerId === 'table') G.table.stacks.push(stack);
				else G.players[toPlayerId].stacks.push(stack);
			} else {
				throw new Error(`The stack was not found. Couldn't move stack ${fromStackId}.`);
			}
		},
		mergeStacks: (G, ctx, { fromStackId, toStackId }) => {
			const owner = ctx.playerID;

			const fromStack =
				G.players[owner].stacks.find(stack => stack.id === fromStackId) ||
				G.table.stacks.find(stack => stack.id === fromStackId);
			const toStack =
				G.players[owner].stacks.find(stack => stack.id === toStackId) ||
				G.table.stacks.find(stack => stack.id === toStackId);

			if (!fromStack) throw new Error(`The stack was not found. Couldn't merge stack ${fromStackId}.`);
			if (!toStack) throw new Error(`The stack was not found. Couldn't merge into stack ${toStackId}.`);

			toStack.cards.splice(0, 0, ...fromStack.cards);

			const playerStackIndex = G.players[owner].stacks.findIndex(stack => stack.id === fromStackId);
			const tableStackIndex = G.table.stacks.findIndex(stack => stack.id === fromStackId);

			if (playerStackIndex !== -1) {
				G.players[owner].stacks.splice(playerStackIndex, 1);
			} else if (tableStackIndex !== -1) {
				G.table.stacks.splice(tableStackIndex, 1);
			} else {
				throw new Error(`The stack was not found. Couldn't move stack ${fromStackId}.`);
			}
		},
	},
	endIf: G => Object.keys(G.players).length === 0,
};

function shuffle(arr) {
	const a = JSON.parse(JSON.stringify(arr));
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
