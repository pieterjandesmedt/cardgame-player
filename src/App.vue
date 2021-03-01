<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
	methods: {
		...mapActions(['init']),
	},
	mounted() {
		this.init();
	},
};
</script>
<style lang="scss">
html {
	background: url('/img/wood01.jpg');
}
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style>
