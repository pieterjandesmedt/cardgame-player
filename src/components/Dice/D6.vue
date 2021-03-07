<template>
	<div class="content" :class="{ 'is-rolling': isRolling }">
		<div class="die" :data-face="value" @click="toggleRoll">
			<figure
				class="has-background-danger-dark"
				:class="`face face-${index}`"
				v-for="index in 6"
				:key="index"
			></figure>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			isRolling: false,
		};
	},
	props: ['value'],
	methods: {
		toggleRoll() {
			this.isRolling = true;
			const vm = this;
			setTimeout(() => {
				vm.isRolling = false;
			}, 500);
		},
	},
};
</script>

<style lang="scss" scoped>
$containerWidth: 50px;
$containerHeight: $containerWidth;
$transitionDuration: 0.5s;
$animationDuration: 1s;

@keyframes roll {
	0% {
		transform: rotateX(0deg) rotateY(0deg);
	}
	100% {
		transform: rotateX(720deg) rotateY(720deg);
	}
}

.content {
	position: relative;
	width: $containerWidth;
	height: $containerHeight;
	perspective: 600px;
	display: inline-block;
	margin: 10px !important;
	&.is-rolling {
		.die {
			animation: roll $animationDuration linear;
		}
	}
}

.die {
	position: relative;
	width: $containerWidth;
	height: $containerHeight;
	transform-style: preserve-3d;
	cursor: pointer;
	transform: translateZ(-$containerWidth);
	transition: transform $transitionDuration ease-out;

	@for $i from 1 through 6 {
		&[data-face='#{$i}'] {
			@if $i < 3 {
				transform: rotateY(-($i - 1) * 90deg);
			} @else if $i > 4 {
				transform: rotateY(-($i % 2) * 90deg + 180deg);
			} @else {
				transform: rotateX(-($i - 3.5) * 2 * 90deg);
			}
		}

		.face.face-#{$i} {
			@if $i < 3 {
				transform: rotateY(($i - 1) * 90deg) translateZ($containerWidth / 2);
			} @else if $i > 4 {
				transform: rotateY(($i % 2) * 90deg + 180deg) translateZ($containerWidth / 2);
			} @else {
				transform: rotateX(($i - 3.5) * 2 * 90deg) translateZ($containerWidth / 2);
			}
		}
	}

	.face {
		position: absolute;
		margin: 0;
		width: $containerWidth;
		height: $containerWidth;
		counter-increment: steps 1;

		&:first-child {
			counter-increment: steps 1;
		}

		&:before {
			content: counter(steps);
			position: absolute;
			color: #fff;
			text-shadow: 0 0 1px #000;
			line-height: $containerHeight;
			font-size: $containerWidth * 0.5;
			transform: translateX(-$containerWidth / 10);
		}
	}
}
</style>
