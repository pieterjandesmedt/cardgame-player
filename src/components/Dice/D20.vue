<template>
	<div class="content" :class="{ 'is-rolling': isRolling }">
		<div class="die" :data-face="value" @click="toggleRoll">
			<figure :class="`face face-${index}`" v-for="index in 20" :key="index"></figure>
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

$faceWidth: $containerWidth * 0.5;
$faceHeight: $faceWidth * 0.86;

$transitionDuration: 0.5s;
$animationDuration: 1s;

$angle: 53deg;
$ringAngle: -11deg;
$sideAngle: 360deg/5;
$opacity: 1;
$color: rgba(30, 180, 20, $opacity);

$rotateX: -$angle;
$translateZ: $faceWidth * 0.335;
$translateY: -$faceHeight * 0.15;
$translateRingZ: $faceWidth * 0.75;
$translateRingY: $faceHeight * 0.78 + $translateY;
$translateLowerZ: $translateZ;
$translateLowerY: $faceHeight * 0.78 + $translateRingY;

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
	transform: rotateX($rotateX);

	@for $i from 1 through 5 {
		&[data-face='#{$i}'] {
			$angleMultiplier: $i - 1;
			transform: rotateX(-$angle) rotateY($sideAngle * $angleMultiplier);
		}
	}

	@for $i from 16 through 20 {
		&[data-face='#{$i}'] {
			$angleMultiplier: $i - 15;
			transform: rotateX(-$angle + 180deg) rotateY(-$sideAngle * $angleMultiplier);
		}
	}

	@for $i from 6 through 10 {
		&[data-face='#{$i}'] {
			$angleMultiplier: $i - 6;
			transform: rotateX(-$ringAngle) rotateZ(180deg) rotateY($sideAngle * $angleMultiplier);
		}
	}

	@for $i from 11 through 15 {
		&[data-face='#{$i}'] {
			$angleMultiplier: $i - 8;
			transform: rotateX(-$ringAngle) rotateY(-$sideAngle * $angleMultiplier - $sideAngle/2);
		}
	}

	.face {
		$horizontalMargin: -$faceWidth * 0.5;

		position: absolute;
		left: 50%;
		top: 0;
		margin: 0 $horizontalMargin;
		border-left: $faceWidth * 0.5 solid transparent;
		border-right: $faceWidth * 0.5 solid transparent;
		border-bottom: $faceHeight solid $color;
		width: 0px;
		height: 0px;
		transform-style: preserve-3d;
		backface-visibility: hidden;

		counter-increment: steps 1;

		&:before {
			content: counter(steps);
			position: absolute;
			top: $faceHeight * 0.25;
			left: -$faceWidth;
			color: #fff;
			text-shadow: 0 0 1px #000;
			font-size: $faceHeight * 0.5;
			text-align: center;
			line-height: $faceHeight * 0.9;
			width: $faceWidth * 2;
			height: $faceHeight;
		}

		@for $i from 1 through 5 {
			&:nth-child(#{$i}) {
				$angleMultiplier: $i - 1;
				transform: rotateY(-$sideAngle * $angleMultiplier)
					translateZ($translateZ)
					translateY($translateY)
					rotateX($angle);
			}
		}

		@for $i from 16 through 20 {
			&:nth-child(#{$i}) {
				$angleMultiplier: $i - 18;
				transform: rotateY($sideAngle * $angleMultiplier + $sideAngle/2)
					translateZ($translateLowerZ)
					translateY($translateLowerY)
					rotateZ(180deg)
					rotateX($angle);
			}
		}

		@for $i from 6 through 10 {
			&:nth-child(#{$i}) {
				$angleMultiplier: $i - 11;
				transform: rotateY(-$sideAngle * $angleMultiplier)
					translateZ($translateRingZ)
					translateY($translateRingY)
					rotateZ(180deg)
					rotateX($ringAngle);
			}
		}

		@for $i from 11 through 15 {
			&:nth-child(#{$i}) {
				$angleMultiplier: $i - 8;
				transform: rotateY($sideAngle * $angleMultiplier + $sideAngle/2)
					translateZ($translateRingZ)
					translateY($translateRingY)
					rotateX($ringAngle);
			}
		}
	}
}
</style>
