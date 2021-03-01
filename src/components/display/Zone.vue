<template>
	<div class="card-zone" :style="zoneStyle">
		<p>
			<b>{{ zone.text }}</b>
		</p>
		<p v-if="value.length > 15">{{ value }}</p>
		<div class="zone-value-circle" :style="circleStyle" v-if="value.length < 3">
			{{ value }}
		</div>
		<div class="zone-value-rotated" :style="rotatedStyle" v-if="value.length > 2 && value.length < 16">
			<span>{{ value }}</span>
		</div>
	</div>
</template>

<script>
function parseHexColor(color) {
	return color
		? [
				parseInt(color.replace('#', '').substr(0, 2), 16) / 255.0,
				parseInt(color.replace('#', '').substr(2, 2), 16) / 255.0,
				parseInt(color.replace('#', '').substr(4, 2), 16) / 255.0,
		  ]
		: [0, 0, 0];
}

export default {
	props: ['zone', 'value'],
	computed: {
		zoneStyle() {
			return `border-color: ${this.zone.color}; background-color: ${this.opacity(this.zone.color, 0.2)}`;
		},
		circleStyle() {
			return `background-color: ${this.zone.color}; color: ${this.textColor(this.zone.color)}`;
		},
		rotatedStyle() {
			return `border-color: ${this.zone.color}`;
		},
	},
	methods: {
		textColor(bgColor) {
			if (!bgColor) {
				return '';
			}
			const colors = parseHexColor(bgColor);
			const adjusted = colors.map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
			return 0.2126 * adjusted[0] + 0.7152 * adjusted[1] + 0.0722 * adjusted[2] > 0.179 ? '#000' : '#fff';
		},
		opacity(color, op = 1) {
			return `rgba(${parseHexColor(color)
				.map(c => c * 255)
				.join()}, ${op})`;
		},
	},
};
</script>

<style>
.card-zone {
	flex: 1 0;
	padding: 0.3em 1.5em 0.3em 0.3em;
	margin: 1px 0;
	position: relative;
	border: 2px solid white;
}

.card-zone p {
	white-space: pre-wrap;
	margin: 0;
}

.card-zone:first-child {
	border-top-left-radius: 0.25em;
	border-top-right-radius: 0.25em;
	margin-top: 0;
}

.card-zone:last-child {
	border-bottom-left-radius: 0.25em;
	border-bottom-right-radius: 0.25em;
	margin-bottom: 0;
}

.zone-value-circle {
	font-weight: bold;
	position: absolute;
	top: 1px;
	right: 2px;
	width: 1.5em;
	height: 1.5em;
	border: 2px solid white;
	border-radius: 50%;
	text-align: center;
	vertical-align: middle;
	line-height: 1.35em;
	/* box-shadow: 1.1px 2px 1px rgba(0, 0, 0, 0.25); */
}

.card-zone:last-child:not(:first-child) .zone-value-circle {
	top: auto;
	bottom: 2px;
}

.zone-value-rotated {
	position: absolute;
	height: 100%;
	width: 1.5em;
	top: 0;
	right: 0;
	text-align: right;
	border-left: 2px solid white;
}

.zone-value-rotated span {
	font-weight: bold;
	position: absolute;
	transform: rotateZ(-90deg);
	transform-origin: 100% 50%;
	text-align: right;
	right: 0.75em;
	top: -0.2em;
	white-space: nowrap;
}
</style>
