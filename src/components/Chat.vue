<template>
	<div class="chat">
		<transition-group name="chat-messages">
			<div
				class="chat-message box is-borderless p-1 my-1 is-relative"
				v-for="(chatMessage, index) in lastChatMessages"
				:key="chatMessage.id"
				:class="messageClass(chatMessage, index)"
			>
				<b v-if="!chatMessage.payload.isBroadcast">{{ chatMessage.payload.senderName }}:</b>
				{{ chatMessage.payload.text }}
			</div>
		</transition-group>
		<form @submit.prevent="sendMessage">
			<b-input icon-right="chat-outline" v-model="message"> </b-input>
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
			this.sendChatMessage({ text: this.message });
			this.message = '';
		},
		messageClass(message, index) {
			const classes = [];

			if (this.lastChatMessages.length > MAX_MESSAGES_ON_SCREEN - 1) classes.push(`index-${index}`);
			if (message.payload.isBroadcast) classes.push('is-broadcast has-background-primary-light');
			else if (message.payload.senderName === this.playerName)
				classes.push('is-own has-background-primary has-text-white');
			else classes.push('is-other has-background-white');

			return classes.join(' ');
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
	max-width: 20em;
	z-index: 9999;
	transition: width 200ms;
	.index-0 {
		opacity: 0.33;
	}
	.index-1 {
		opacity: 0.66;
	}
	.is-broadcast {
		margin: 0 1em;
		font-style: italic;
	}
	.is-own {
		margin-left: 2em;
		border-bottom-right-radius: 0;
		&::after {
			content: '';
			width: 0;
			height: 0;
			border-bottom: 5px solid #7957d5;
			border-right: 5px solid transparent;
			position: absolute;
			bottom: 0;
			right: -5px;
		}
	}
	.is-other {
		margin-right: 2em;
		border-bottom-left-radius: 0;
		&::before {
			content: '';
			width: 0;
			height: 0;
			border-bottom: 5px solid #fff;
			border-left: 5px solid transparent;
			position: absolute;
			bottom: 0;
			left: -5px;
		}
	}
	.chat-message {
		transition: all 0.2s;
	}
	.chat-messages-leave-to {
		opacity: 0 !important;
		transform: translateY(-2.5em);
	}
	.chat-messages-enter {
		opacity: 0 !important;
		transform: translateY(2.5em);
	}
	.is-borderless {
		border: none;
	}
}
</style>
