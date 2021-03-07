<template>
	<div class="content" :class="{ 'is-rolling': isRolling }">
		<div class="die" :data-face="value" @click="toggleRoll">
			<figure :class="`face face-${index}`" v-for="index in 4" :key="index"></figure>
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
@use "sass:math";
$containerWidth: 70px;
$containerHeight: $containerWidth;
$transitionDuration: 0.5s;
$animationDuration: 1s;

$sideHeight: math.cos(45deg) * $containerWidth;
$distanceFromCenter: math.tan(30deg) * $containerWidth / 2;

@keyframes roll {
	0% {
		transform: rotateX(0deg) rotateY(0deg);
	}
	100% {
		transform: rotateX(720deg) rotateY(720deg);
	}
}

@keyframes slow-roll {
	0% {
		transform: rotateX(0deg);
		transform: rotateY(0deg);
	}
	100% {
		transform: rotateX(720deg);
		transform: rotateY(360deg);
	}
}

.content {
	position: relative;
	width: $containerWidth;
	height: $containerHeight;
	perspective: 600px;
	display: inline-block;
	margin: 10px 0 !important;
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
	// animation: slow-roll 10s infinite linear;

	@for $i from 1 through 3 {
		&[data-face='#{$i}'] {
			transform: rotateX(-24deg) rotateY(-($i - 1) * 120deg);
		}

		.face.face-#{$i} {
			transform: rotateY(($i - 1) * 120deg) translateZ($distanceFromCenter / 3.4) rotateX(24deg);
		}
	}

	&[data-face='4'] {
		// transform: rotateY(-180deg) rotateX(-90deg);
	}

	.face.face-4 {
		// transform: translateY($distanceFromCenter) translateZ(-$distanceFromCenter * 0.7) rotateX(90deg) rotateY(180deg)
		// 	translateZ($distanceFromCenter / 3.4);
	}
	.face {
		position: absolute;
		margin: 0;
		width: $containerWidth;
		height: $containerWidth;
		counter-increment: steps 1;
		transform-origin: center center;
		// opacity: 0.5;

		&:first-child {
			counter-increment: steps 1;
		}

		&:before {
			content: counter(steps);
			position: absolute;
			color: #fff;
			text-shadow: 0 0 1px #000;
			line-height: $sideHeight;
			font-size: $containerWidth * 0.5;
			transform: translate(-$containerWidth / 7, $sideHeight / 2);
			z-index: 1;
		}
		&:after {
			content: '';
			$width: 0;
			$height: 0;
			position: absolute;
			border: $containerWidth solid transparent;
			border-bottom-color: #296fa8;
			border-width: 0 $containerWidth / 2 $sideHeight;
			bottom: 0;
			left: 0;
			display: block;
		}
	}
}
</style>
