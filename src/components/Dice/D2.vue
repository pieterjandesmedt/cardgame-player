<template>
	<div class="coin" :class="{ 'is-rolling': isRolling }" :data-face="value" @click="toggleRoll">
		<div class="face face-1">
			<span class="icon">
				<i class="mdi mdi-bitcoin has-text-warning"></i>
			</span>
		</div>
		<div :class="`side side-${index}`" v-for="index in 30" :key="index"></div>
		<div class="face face-2">
			<span class="icon">
				<i class="mdi mdi-head-outline has-text-warning"></i>
			</span>
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
$containerWidth: 60px;
$containerHeight: $containerWidth;
$coinWidth: 10px;
$numberOfSides: 30;
$sideHeight: $containerHeight * 3.1415926535897 / $numberOfSides;
$transitionDuration: 0.5s;

@keyframes roll {
	0% {
		transform: rotateY(0deg);
	}
	100% {
		transform: rotateY(720deg);
	}
}

.coin {
	cursor: pointer;
	display: inline-block;
	width: $containerWidth;
	height: $containerHeight;
	transform-style: preserve-3d;
	position: relative;
	top: 0;
	left: 0;
	margin: 5px !important;
	transition: transform $transitionDuration linear;
	&.is-rolling {
		animation: roll $transitionDuration linear;
	}

	@for $i from 1 through 2 {
		&[data-face='#{$i}'] {
			transform: rotateY(($i - 1) * 180deg);
		}
	}

	.face {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: absolute;
		top: 0;
		left: 0;
		background: #ebb13e;
		border: $containerWidth / 10 solid #ffdd57;
		display: flex;
		&.face-1 {
			z-index: -1;
			border-color: transparent;
		}
		&.face-2 {
			transform: rotateY(180deg) translateZ($coinWidth);
			z-index: 1;
			.icon .mdi::before {
				font-size: $containerHeight * 0.6;
				line-height: $containerHeight;
				transform: translate(-1px, -$containerWidth / 10);
			}
		}
		.icon {
			width: $containerWidth;
			height: $containerHeight;
			.mdi::before {
				font-size: $containerHeight;
				line-height: $containerHeight;
				transform: translate(-$containerWidth / 10, -$containerWidth / 10);
			}
		}
	}
	.side {
		background: #ffdd57;
		width: $coinWidth;
		height: $sideHeight;
		position: absolute;
		transform-origin: center center;
		@for $i from 1 through $numberOfSides {
			&.side-#{$i} {
				// first bring the side part to the center of the coin
				transform: translate3d(
						$containerWidth / 2 - $coinWidth / 2,
						$containerHeight / 2 - $sideHeight / 2,
						-$coinWidth / 2
					)
					// then rotate it so it faces the side of the coin
					rotateY(90deg)
					// then rotate it so its angle follows the circle
					rotateX($i * 360deg / $numberOfSides)
					// then move it to the side of the coin
					translateZ($containerWidth / 2);
			}
		}
	}
}
</style>
<style lang="scss" scoped>
$containerWidth: 70px;
$containerHeight: $containerWidth;
.coin {
	.face {
		.icon.is-large {
			width: $containerWidth * 0.8;
			height: $containerHeight * 0.8;
		}
	}
}
</style>
