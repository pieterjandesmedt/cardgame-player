<template>
	<div class="columns is-mobile">
		<dropzone
			class="column mx-1 has-text-centered"
			v-for="player in otherPlayers"
			:key="player.id"
			:data-player-id="player.id"
			@drop="handleDrop"
		>
			<b-icon icon="account" size="is-large"> </b-icon>
			<p>{{ player.name }}</p>
		</dropzone>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import Dropzone from './Interact/Dropzone.vue';
import { dropHandler } from '@/mixins';

export default {
	components: { Dropzone },
	props: ['players'],
	computed: {
		...mapState(['playerID']),
		otherPlayers() {
			return this.players.filter(this.playerFilter);
		},
	},
	mixins: [dropHandler],
	methods: {
		playerFilter(p) {
			return p.name && p.id != this.playerID;
		},
	},
};
</script>

<style lang="scss">
.dropzone {
	display: inline-block;
	padding: 10px 2px 20px 10px;
	border: 1px dashed gray;
	border-radius: 8px;
	position: relative;
}
.drop-target {
	border-color: white;
	box-shadow: 0 0 10px gold, 0 0 10px inset gold;
}
</style>
