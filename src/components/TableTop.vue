<template>
	<div>
		<div class="container is-fluid">
			<div class="columns">
				<nav-bar class="column is-narrow"></nav-bar>
				<other-players class="column is-offset-1 mt-0" :players="matchData"></other-players>
			</div>
			<stack v-for="stack in tableStacks" :key="stack.id" :isTable="true" :stack="stack"></stack>
		</div>
		<section class="hero is-dark" v-if="tableStacks.length > 0">
			<div class="hero-body py-5"></div>
		</section>
		<div class="container is-fluid">
			<stack v-for="stack in stacks" :key="stack.id" :stack="stack"></stack>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import NavBar from './NavBar';
import OtherPlayers from './OtherPlayers';
import Stack from './Stack.vue';

export default {
	name: 'TableTop',
	components: { NavBar, Stack, OtherPlayers },
	props: {
		msg: String,
	},
	computed: {
		...mapState(['matchData']),
		...mapGetters(['stacks', 'tableStacks']),
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
