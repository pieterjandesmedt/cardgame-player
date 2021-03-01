import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
// import cuid from 'cuid';
import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { CardGame } from '../game.js';

const server =
	process.env.NODE_ENV === 'production' ? 'https://cardgame-player.herokuapp.com/' : 'http://localhost:8000';
const socketServer =
	process.env.NODE_ENV === 'production' ? 'wss://cardgame-player.herokuapp.com/' : 'ws://localhost:8000';

const lobbyClient = new LobbyClient({ server });
const client = new Client({
	game: CardGame,
	multiplayer: SocketIO({ server: socketServer }),
	debug: false,
});

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
// const playerID = cuid();

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
		cutStack(_, payload) {
			client.moves.cutStack(payload);
		},
		deleteStack(_, id) {
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
					console.log('err:', err);
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
		showAllCards(_, stack) {
			client.moves.showAllCards(stack);
		},
		hideAllCards(_, stack) {
			client.moves.hideAllCards(stack);
		},
		moveCardBetweenStacks(_, payload) {
			client.moves.moveCardBetweenStacks(payload);
		},
		giveCardToPlayer(_, payload) {
			client.moves.giveCardToPlayer(payload);
		},
		flipCard(_, payload) {
			client.moves.flipCard(payload);
		},
		giveStackToPlayer(_, payload) {
			client.moves.giveStackToPlayer(payload);
		},
		mergeStacks(_, payload) {
			client.moves.mergeStacks(payload);
		},
		shuffleStack(_, stack) {
			client.moves.shuffleStack(stack);
		},
		sendChatMessage(_, payload) {
			client.sendChatMessage(payload);
		},
	},
};

export default new Vuex.Store({
	...store,
	modules: {},
	plugins: [vuexLocal.plugin],
});
