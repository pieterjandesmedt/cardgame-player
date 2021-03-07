import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
// import cuid from 'cuid';
import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { CardGame } from '../game.js';
import { EventBus } from '@/components/event-bus.js';

const server =
	process.env.NODE_ENV === 'production' ? 'https://cardgame-player.herokuapp.com/' : 'http://localhost:8000/';
const socketServer =
	process.env.NODE_ENV === 'production' ? 'https://cardgame-player.herokuapp.com/' : 'http://localhost:8000/';

const lobbyClient = new LobbyClient({ server });
const client = new Client({
	game: CardGame,
	multiplayer: SocketIO({ server: socketServer }),
	debug: false,
});

let lastMessageId;

const vuexLocal = new VuexPersistence({
	storage: window.localStorage,
	key: 'card-game-client',
	reducer: state => ({
		credentials: state.credentials,
		playerID: state.playerID,
		matchID: state.matchID,
		playerName: state.playerName,
	}),
});

Vue.use(Vuex);

const store = {
	state: {
		matches: [],
		credentials: '',
		playerID: '',
		playerName: '',
		matchID: '',
		G: {},
		ctx: {},
		matchData: [],
		chatMessages: [],
	},
	getters: {
		stacks: state => {
			if (!state.G?.players) return [];
			return state.G.players[state.playerID]?.stacks || [];
		},
		tableStacks: state => {
			if (!state.G?.table) return [];
			return state.G.table?.stacks || [];
		},
		diceBar: state => {
			if (!state.G?.diceBar)
				return {
					d2: [],
					d4: [],
					d6: [],
					d8: [],
					d10: [],
					d20: [],
				};
			return state.G.diceBar;
		},
	},
	mutations: {
		setMatches(state, payload) {
			state.matches = payload;
		},
		setCredentials(state, payload) {
			state.credentials = payload;
		},
		setPlayerName(state, payload) {
			state.playerName = payload;
		},
		setPlayerID(state, payload) {
			state.playerID = payload;
		},
		setMatchID(state, payload) {
			state.matchID = payload;
		},
		setGameState(state, { G, ctx }) {
			state.G = Object.freeze(G);
			state.ctx = Object.freeze(ctx);
		},
		setMatchData(state, payload) {
			state.matchData = payload;
		},
		setChatMessages(state, payload) {
			state.chatMessages = payload;
		},
	},
	actions: {
		init({ commit }) {
			const sync = () => {
				const gameState = client.getState();
				if (!gameState) return;
				commit('setGameState', gameState);
				commit('setMatchData', client.matchData || []);
				commit('setChatMessages', client.chatMessages || []);
				if (client.chatMessages.length > 0) {
					const lastMessage = client.chatMessages[client.chatMessages.length - 1];
					if (lastMessage.payload.event && lastMessage.id !== lastMessageId) {
						lastMessageId = lastMessage.id;
						EventBus.$emit(lastMessage.payload.event, lastMessage.payload.eventPayload);
					}
				}
			};
			client.subscribe(sync);
			sync();
		},
		createStack(_, stack) {
			client.moves.createStack(stack);
		},
		updateStack(_, stack) {
			client.moves.updateStack(stack);
		},
		cutStack({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.id);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} cut stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.cutStack(payload);
		},
		deleteStack({ dispatch, state }, id) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === id);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} deleted stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.deleteStack(id);
		},
		setPlayerName({ commit }, playerName) {
			commit('setPlayerName', playerName);
		},
		async listGames() {
			const { games } = await lobbyClient.listGames();
			return games;
		},
		async listMatches({ commit }) {
			const { matches } = await lobbyClient.listMatches('card-game');
			commit('setMatches', matches);
			return matches;
		},
		async createGame(_, numPlayers) {
			try {
				const { matchID } = await lobbyClient.createMatch('card-game', {
					numPlayers: parseInt(numPlayers, 10),
				});
				return matchID;
			} catch (err) {
				console.error(err);
			}
		},
		async joinGame({ commit, state }, { matchID, playerName }) {
			console.log(`player ${playerName} wants to join match ${matchID}`);
			// if there's a matchID, leave that match first
			if (state.matchID) {
				try {
					await lobbyClient.leaveMatch('card-game', state.matchID, {
						playerID: state.playerID,
						credentials: state.credentials,
					});
				} catch (err) {
					// console.log('err:', err);
				}
			}
			const match = await lobbyClient.getMatch('card-game', matchID);
			let playerID;
			if (state.matchID && match.matchID === state.matchID && state.playerID) {
				playerID = `${state.playerID}`;
			} else {
				const firstFreeSpot = match.players.find(p => !p.name);
				playerID = `${firstFreeSpot.id}`;
			}
			const { playerCredentials } = await lobbyClient.joinMatch('card-game', matchID, {
				playerID,
				playerName,
			});
			commit('setMatchID', match.matchID);
			commit('setPlayerID', playerID);
			commit('setCredentials', playerCredentials);
			client.updateCredentials(state.credentials);
			client.updatePlayerID(state.playerID);
			client.updateMatchID(state.matchID);
			client.start();
		},
		async leaveGame({ commit, state }) {
			if (state.matchID) {
				try {
					await lobbyClient.leaveMatch('card-game', state.matchID, {
						playerID: state.playerID,
						credentials: state.credentials,
					});
				} catch (err) {
					console.error(err);
				}
				client.stop();
				commit('setCredentials', '');
				commit('setPlayerID', '');
				commit('setMatchID', '');
				commit('setMatchData', []);
				commit('setChatMessages', []);
			}
		},
		showAllCards({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.id);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} flipped stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.showAllCards(payload);
		},
		hideAllCards({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.id);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} flipped stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.hideAllCards(payload);
		},
		moveCardBetweenStacks({ dispatch, state }, payload) {
			const fromStack = state.G?.table?.stacks?.find(stack => stack.id === payload.fromStackId);
			if (fromStack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} took a card of stack '${fromStack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			const toStack = state.G?.table?.stacks?.find(stack => stack.id === payload.toStackId);
			if (toStack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} put a card in stack '${toStack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.moveCardBetweenStacks(payload);
		},
		giveCardToPlayer({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.fromStackId);
			if (stack) {
				if (payload.toPlayerId === state.playerID)
					dispatch('sendChatMessage', {
						text: `${state.playerName} took a card of stack '${stack.name || 'Deck'}'`,
						isBroadcast: true,
					});
				else
					dispatch('sendChatMessage', {
						text: `${state.playerName} gave a card of stack '${stack.name || 'Deck'}' to ${
							state.matchData?.find(p => p.id == payload.toPlayerId).name
						}`,
						isBroadcast: true,
					});
			} else {
				dispatch('sendChatMessage', {
					text: `${state.playerName} gave a card to ${
						state.matchData?.find(p => p.id == payload.toPlayerId).name
					}`,
					isBroadcast: true,
				});
			}
			client.moves.giveCardToPlayer(payload);
		},
		flipCard({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.fromStackId);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} flipped a card of stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.flipCard(payload);
		},
		giveStackToPlayer({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.fromStackId);
			if (stack) {
				if (payload.toPlayerId === state.playerID)
					dispatch('sendChatMessage', {
						text: `${state.playerName} took stack '${stack.name || 'Deck'}'`,
						isBroadcast: true,
					});
				else
					dispatch('sendChatMessage', {
						text: `${state.playerName} gave stack '${stack.name || 'Deck'}' to ${
							state.matchData?.find(p => p.id == payload.toPlayerId).name
						}`,
						isBroadcast: true,
					});
			} else if (payload.toPlayerId !== 'table') {
				dispatch('sendChatMessage', {
					text: `${state.playerName} gave a stack to ${
						state.matchData?.find(p => p.id == payload.toPlayerId)?.name
					}`,
					isBroadcast: true,
				});
			}
			client.moves.giveStackToPlayer(payload);
		},
		takeStackInHand({ dispatch, state }, fromStackId) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === fromStackId);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} took stack '${stack.name || 'Deck'}' from the table`,
					isBroadcast: true,
				});
			}
			dispatch('giveStackToPlayer', { fromStackId, toPlayerId: state.playerID });
		},
		putStackOnTable({ dispatch, state }, fromStackId) {
			dispatch('giveStackToPlayer', { fromStackId, toPlayerId: 'table' });
			dispatch('sendChatMessage', {
				text: `${state.playerName} put a stack on the table`,
				isBroadcast: true,
			});
		},
		mergeStacks({ dispatch, state }, payload) {
			const fromStack = state.G?.table?.stacks?.find(stack => stack.id === payload.fromStackId);
			const toStack = state.G?.table?.stacks?.find(stack => stack.id === payload.toStackId);
			if (fromStack && toStack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} merged stack '${fromStack.name || 'Deck'}' into stack '${toStack.name ||
						'Deck'}'`,
					isBroadcast: true,
				});
			} else if (fromStack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} took stack '${fromStack.name || 'Deck'}' from the table`,
					isBroadcast: true,
				});
			} else if (toStack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} merged one of his stacks with stack '${toStack.name || 'Deck'}'`,
					isBroadcast: true,
				});
			}
			client.moves.mergeStacks(payload);
		},
		shuffleStack({ dispatch, state }, payload) {
			const stack = state.G?.table?.stacks?.find(stack => stack.id === payload.id);
			if (stack) {
				dispatch('sendChatMessage', {
					text: `${state.playerName} shuffled stack '${stack.name || 'Deck'}'`,
					isBroadcast: true,
					event: 'shuffle-stack',
					eventPayload: stack.id,
				});
			}
			client.moves.shuffleStack(payload);
		},
		sendChatMessage({ state }, payload) {
			client.sendChatMessage({
				senderName: state.playerName,
				...payload,
			});
		},
		undo() {
			console.log('undo');
			client.undo();
		},
		setDiceBar(_, newDiceBar) {
			client.moves.setDiceBar(newDiceBar);
		},
		rollDie({ dispatch, state }, payload) {
			client.moves.rollDie(payload);
			dispatch('sendChatMessage', {
				text: `${state.playerName} rolled a die`,
				isBroadcast: true,
				event: 'roll-die',
				eventPayload: payload,
			});
		},
	},
};

export default new Vuex.Store({
	...store,
	modules: {},
	plugins: [vuexLocal.plugin],
});
