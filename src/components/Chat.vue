<template>
	<div class="chat is-size-7">
		<p
			class="box is-shadowless is-borderless p-1 my-1 has-background-primary-light"
			v-for="(chatMessage, index) in lastChatMessages"
			:key="chatMessage.id"
			:style="messageStyle(chatMessage, index)"
		>
			<b v-if="!chatMessage.payload.isBroadcast">{{ chatMessage.payload.senderName }}:</b>
			{{ chatMessage.payload.text }}
		</p>
		<form @submit.prevent="sendMessage">
			<b-input icon-right="chat-outline" size="is-small" v-model="message"> </b-input>
		</form>
	</div>
</template>

<script>
const MAX_MESSAGES_ON_SCREEN = 7;

import { mapActions, mapState } from 'vuex';
export default {
	data() {
		return {
			isMinimized: false,
			message: '',
		};
	},
	computed: {
		...mapState(['chatMessages', 'playerName', 'matchData']),
		lastChatMessages() {
			return this.chatMessages.slice(Math.max(this.chatMessages.length - MAX_MESSAGES_ON_SCREEN, 0));
		},
	},
	methods: {
		...mapActions(['sendChatMessage']),
		sendMessage() {
			this.sendChatMessage(this.message);
			this.message = '';
		},
		messageStyle(message, index) {
			const opacity =
				this.lastChatMessages.length === MAX_MESSAGES_ON_SCREEN && index < 2 ? index * 0.33 + 0.33 : undefined;

			if (message.payload.isBroadcast) {
				return {
					margin: '0 1em',
					'font-style': 'italic',
					opacity,
				};
			}
			if (message.payload.senderName === this.playerName) {
				return {
					'margin-left': '2em',
					'border-bottom-right-radius': 0,
					'background-color': '#7957d5',
					color: '#fff',
					opacity,
				};
			}
			return {
				'margin-right': '2em',
				'border-bottom-left-radius': 0,
				opacity,
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
