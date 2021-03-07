<template>
	<div class="content" :class="{ 'is-rolling': isRolling }">
		<div class="die" :data-face="value" @click="toggleRoll">
			<figure :class="`face face-${index}`" v-for="index in 10" :key="index"></figure>
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
$containerWidth: 70px;
$containerHeight: $containerWidth;

$upperHeight: $containerWidth * 0.5;
$lowerHeight: $containerWidth * 0.12;
$internalWidth: $upperHeight * 0.52;

$transitionDuration: 0.5s;
$animationDuration: 1s;

$angle: 45deg;
$sideAngle: 360deg/5;
$opacity: 0.75;
$color: rgba(70, 94, 113, $opacity);

$translateZ: $upperHeight * 0.34;
$translateY: $lowerHeight * 0.29;
$translateLowerZ: -$translateZ;
$translateLowerY: -$translateY;
$rotateX: $angle;

@keyframes roll {
	0% {
		transform: rotateX(0deg) rotateY(0deg);
	}
	100% {
		transform: rotateX(720deg) rotateY(720deg);
	}
}

.content {
	margin: 0 !important;
	position: relative;
	width: $containerWidth;
	height: $containerHeight;
	perspective: 600px;
	display: inline-block;
	&.is-rolling {
		.die {
			animation: roll $animationDuration linear;
		}
	}
}

.die {
	position: absolute;
	width: 100%;
	height: 100%;
	transform-style: preserve-3d;
	transition: transform $transitionDuration ease-out;
	cursor: pointer;

	transform: rotateX(-$angle);

	&.reset {
		transition: transform 0.5s ease-out;
		transform: rotateX(0);
	}

	@for $i from 1 through 10 {
		&[data-face='#{$i}'] {
			@if $i % 2 == 1 {
				$angleMultiplier: $i / 2;
				transform: rotateX(-$angle) rotateY($sideAngle * $angleMultiplier);
			} @else {
				$angleMultiplier: ($i + 1) / 2;
				transform: rotateX(-180deg - $angle) rotateY(-$sideAngle * $angleMultiplier);
			}
		}

		.face.face-#{$i} {
			@if $i % 2 == 1 {
				// even sides are in the upper position of the die

				$angleMultiplier: $i / 2;
				transform: rotateY(-$sideAngle * $angleMultiplier)
					translateZ($translateZ)
					translateY($translateY)
					rotateX($angle);
			} @else {
				// odd sides are in the lower position of the die
				top: $upperHeight;

				$angleMultiplier: ($i + 1) / 2;
				transform: rotateY($sideAngle * $angleMultiplier)
					translateZ($translateLowerZ)
					translateY($translateLowerY)
					rotateZ(180deg)
					rotateY(180deg)
					rotateX($angle);
			}
		}
	}

	.face {
		$horizontalMargin: -$internalWidth;

		position: absolute;
		left: 50%;
		top: 0;
		margin: 0 $horizontalMargin;
		border-left: $internalWidth solid transparent;
		border-right: $internalWidth solid transparent;
		border-bottom: $upperHeight solid $color;
		width: 0px;
		height: 0px;
		transform-style: preserve-3d;
		backface-visibility: hidden;

		counter-increment: steps 1;

		&:first-child {
			counter-increment: steps 1;
		}

		&:before {
			content: counter(steps);
			position: absolute;
			top: $upperHeight * 0.25;
			left: -$internalWidth;
			color: #fff;
			text-shadow: 0 0 1px #000;
			font-size: $upperHeight * 0.5;
			text-align: center;
			line-height: $upperHeight;
			width: $internalWidth * 2;
			height: $upperHeight;
		}

		&:after {
			content: '';
			position: absolute;
			bottom: -($upperHeight + $lowerHeight);
			left: -$internalWidth;
			border-left: $internalWidth solid transparent;
			border-right: $internalWidth solid transparent;
			border-top: $lowerHeight solid $color;
			width: 0px;
			height: 0px;
		}
	}
}
</style>
