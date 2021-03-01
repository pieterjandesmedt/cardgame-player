import Vue from 'vue';
import VueRouter from 'vue-router';
import Game from '../views/Game.vue';
import Lobby from '../views/Lobby.vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/match/:matchID',
		name: 'Game',
		component: Game,
	},
	{
		path: '/lobby',
		name: 'Lobby',
		component: Lobby,
	},
	{
		path: '*',
		redirect: '/lobby',
	},
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
});

export default router;
