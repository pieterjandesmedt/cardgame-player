import interact from 'interactjs';
import { EventBus } from '../event-bus.js';

const Interact = {
	props: {
		draggableOpt: {
			type: Object,
			required: false,
		},
		resizableOpt: {
			type: Object,
			required: false,
		},
		resizeClass: {
			type: String,
			required: false,
			default: '.interact',
		},
		resize: {
			type: Boolean,
			required: false,
			default: false,
		},
		drag: {
			type: Boolean,
			required: false,
			default: true,
		},
		tap: {
			type: Boolean,
			required: false,
			default: false,
		},
		doubletap: {
			type: Boolean,
			required: false,
			default: false,
		},
		hold: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	mounted() {
		const resizableSettings = {
			inertia: true,
			restrictEdges: {
				outer: 'parent',
				endOnly: true,
			},
			edges: {
				left: true,
				right: true,
				bottom: true,
				top: true,
			},
			preserveAspectRatio: false,
		};
		const draggableSettings = {
			inertia: true,
			restrict: {
				restriction: '.room',
			},
			autoScroll: true,
			onmove: this.dragMoveListener,
			onend: this.dragEndListener,
		};
		EventBus.$on('order-stacks', this.resetPosition);

		interact(this.$el)
			.resizable(this.resizableOpt ? this.resizableOpt : resizableSettings)
			.draggable(this.draggableOpt ? this.draggableOpt : draggableSettings)
			.on('resizemove', this.resizeListener)
			.on('tap', this.tapListener)
			.on('doubletap', this.doubletapListener)
			.on('hold', this.holdListener);
	},
	methods: {
		resizeListener(event) {
			if (this.resize) {
				const { target } = event;

				target.style.width = `${event.rect.width}px`;
				target.style.height = `${event.rect.height}px`;
				this.$emit('resize', event);
			}
		},
		dragMoveListener(event) {
			if (this.drag) {
				const { target } = event;
				const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
				const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

				target.style.webkitTransform = `translate(${x}px, ${y}px)`;
				target.style.transform = `translate(${x}px, ${y}px)`;

				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
				this.$emit('drag', event);
			}
		},
		dragEndListener(event) {
			if (this.drag) {
				this.$emit('dragend', event);
			}
		},
		tapListener(event) {
			if (this.tap) {
				this.$emit('tap', event);
			}
		},
		doubletapListener(event) {
			if (this.doubletap) {
				event.preventDefault();
				this.$emit('doubletap', { event, attributes: this.$el.attributes });
			}
		},
		holdListener(event) {
			if (this.hold) {
				this.$emit('hold', event);
			}
		},
		resetPosition() {
			this.$el.style.webkitTransform = `translate(0px, 0px)`;
			this.$el.style.transform = `translate(0px, 0px)`;

			this.$el.setAttribute('data-x', 0);
			this.$el.setAttribute('data-y', 0);
		},
	},
	beforeDestroy() {
		interact(this.$el).unset();
		EventBus.$off('order-stacks', this.resetPosition);
	},
};

const Dropzone = {
	props: {
		options: {
			type: Object,
			required: false,
		},
		dropzoneClass: {
			type: String,
			required: false,
			default: '.dropzone',
		},
		accept: {
			type: String,
			required: false,
			default: '.dropable',
		},
	},
	mounted() {
		const settings = {
			// only accept elements matching this CSS selector
			accept: '.dropable',
			// Require a 50% element overlap for a drop to be possible
			// overlap: 0.01,

			// listen for drop related events:

			ondropactivate: this.dropactivateListener,
			ondragenter: this.dragenterListener,
			ondragleave: this.dragleaveListener,
			ondrop: this.dropListener,
			ondropdeactivate: this.dropdeactivateListener,
		};
		interact(this.$el).dropzone(this.options ? this.options : settings);
	},
	methods: {
		dropactivateListener(event) {
			event.target.classList.add('drop-active');
			this.$emit('drop-active', event);
		},
		dragenterListener(event) {
			const draggableElement = event.relatedTarget;
			event.target.classList.add('drop-target');
			draggableElement.classList.add('can-drop');
			this.$emit('drag-enter', event);
		},
		dragleaveListener(event) {
			const draggableElement = event.relatedTarget;
			event.target.classList.remove('drop-target');
			draggableElement.classList.remove('can-drop');
			this.$emit('drag-leave', event);
		},
		dropListener(event) {
			this.$emit('drop', event);
		},
		dropdeactivateListener(event) {
			event.target.classList.remove('drop-active');
			event.target.classList.remove('drop-target');
			this.$emit('drop-deactive', event);
		},
	},
	beforeDestroy() {
		interact(this.$el).unset();
	},
};

export { Interact, Dropzone };
