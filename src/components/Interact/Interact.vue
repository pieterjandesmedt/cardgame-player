<template>
	<div class="interact">
		<slot></slot>
	</div>
</template>

<script>
import { Interact } from './vue-interact.js';

export default {
	name: 'Interact',
	mixins: [Interact],
};
</script>

<style>
.interact {
	touch-action: none;
	user-select: none;
	will-change: transform, margin;
}
</style>
