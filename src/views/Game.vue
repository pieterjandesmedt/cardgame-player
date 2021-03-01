<template>
	<div class="container is-fluid my-3">
		<table-top></table-top>
		<chat></chat>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import TableTop from '@/components/TableTop.vue';
import Chat from '@/components/Chat.vue';

export default {
	name: 'Game',
	components: {
		TableTop,
		Chat,
	},
	computed: {
		...mapState(['playerName']),
	},
	methods: {
		...mapActions(['joinGame', 'leaveGame']),
		async join(matchID) {
			try {
				await this.joinGame({
					matchID,
					playerName: this.playerName,
				});
			} catch (err) {
				console.log('err:', err);
				this.$router.push('/lobby');
			}
		},
	},
	mounted() {
		if (!this.$route.params.matchID) this.$router.push('/lobby');
		this.join(this.$route.params.matchID);
	},
	async beforeDestroy() {
		await this.leaveGame();
	},
};
</script>
