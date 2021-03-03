<template>
	<div class="chat is-size-7">
		<p
			class="box is-shadowless is-borderless p-1 my-1"
			v-for="chatMessage in lastChatMessages"
			:key="chatMessage.id"
			:style="messageStyle(chatMessage)"
		>
			<b>{{ messageSenderName(chatMessage) }}:</b> {{ chatMessage.payload }}
		</p>
		<form @submit.prevent="sendMessage">
			<b-input icon-right="chat-outline" size="is-small" v-model="message"> </b-input>
		</form>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
	data() {
		return {
			isMinimized: false,
			message: '',
		};
	},
	computed: {
		...mapState(['chatMessages', 'playerID', 'matchData']),
		lastChatMessages() {
			return this.chatMessages.slice(Math.max(this.chatMessages.length - 5, 0));
		},
	},
	methods: {
		...mapActions(['sendChatMessage']),
		sendMessage() {
			this.sendChatMessage(this.message);
			this.message = '';
		},
		messageStyle(message) {
			if (message.sender === this.playerID) {
				return {
					'margin-left': '1em',
					'border-bottom-right-radius': 0,
					'background-color': '#7957d5',
					color: '#fff',
				};
			}
			return {
				'margin-right': '1em',
				'border-bottom-left-radius': 0,
			};
		},
		messageSenderName(message) {
			return this.matchData.find(player => player.id == message.sender).name;
		},
	},
};
</script>

<style lang="scss">
.chat {
	position: fixed;
	right: 1em;
	bottom: 1em;
	max-width: 300px;
	z-index: 9999;
	p {
		opacity: 0.9;
		&.is-borderless {
			border: none;
		}
	}
}
</style>
