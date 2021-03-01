<template>
	<div class="container">
		<h1 class="is-size-3">Lobby</h1>
		<b-field label="Your name" label-position="on-border" class="mt-6">
			<b-input placeholder="Fill in your name or nickname" v-model="name"></b-input>
			<template #message>
				<span v-if="!playerName">Fill in your name to create or join a game</span>
			</template>
		</b-field>
		<div v-if="playerName">
			<div v-if="matches.length > 0" class="mt-6">
				<h2 class="is-size-4">Join game</h2>
				<div v-for="match in matches" :key="match.matchID">
					<router-link
						:to="`/match/${match.matchID}`"
						:disabled="!playerName"
						:event="playerName ? 'click' : ''"
						><div class="box py-2 my-1">
							{{ match.gameName }} <small class="is-size-7">({{ match.matchID }})</small> -
							{{ match.players.filter(p => !p.name).length }} seats available
						</div>
					</router-link>
				</div>
			</div>
			<div class="mt-6">
				<h2 class="is-size-4">Create game</h2>
				<b-field label="Number of players" label-position="on-border" class="mt-3">
					<b-input
						min="1"
						max="20"
						type="number"
						placeholder="Number of players"
						v-model="numPlayers"
					></b-input>
					<p class="control">
						<b-button class="button is-primary" @click="startGame" :disabled="!playerName"
							>Create game</b-button
						>
					</p>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
	data() {
		return {
			numPlayers: 4,
			intervalId: undefined,
		};
	},
	computed: {
		...mapState(['matches', 'playerName']),
		name: {
			get() {
				return this.playerName;
			},
			set(value) {
				this.setPlayerName(value);
			},
		},
	},
	methods: {
		...mapActions(['listMatches', 'createGame', 'joinGame', 'setPlayerName']),
		async startGame() {
			const matchID = await this.createGame(this.numPlayers);
			this.$router.push(`/match/${matchID}`);
		},
	},
	mounted() {
		const vm = this;
		vm.listMatches();
		this.intervalId = setInterval(() => {
			vm.listMatches();
		}, 5000);
	},
	beforeDestroy() {
		clearInterval(this.intervalId);
	},
};
</script>

<style lang="scss">
a[disabled='disabled'] {
	cursor: not-allowed;
	.box {
		color: lightgrey;
	}
}
</style>
