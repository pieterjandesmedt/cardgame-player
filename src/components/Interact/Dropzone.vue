<template>
	<div class="dropzone">
		<slot></slot>
	</div>
</template>

<script>
import { Dropzone } from './vue-interact.js';

export default {
	name: 'Dropzone',
	mixins: [Dropzone],
};
</script>
