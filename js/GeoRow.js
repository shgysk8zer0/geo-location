function getSlot(name, root) {
	return root.querySelector(`[data-field="${name}"]`);
}

function getSlotNodes(name, root) {
	const slot = getSlot(name, root);

	if (slot instanceof HTMLElement) {
		return [...slot.children];
	} else {
		return [];
	}
}

function getSlotNode(name, root) {
	const nodes = getSlotNodes(name, root);

	if (nodes.length === 1) {
		return nodes[0];
	}
}

function clearSlotNodes(name, root) {
	getSlotNodes(name, root).forEach(node => node.remove());
}

customElements.define('geo-row', class HTMLGeoRowElements extends HTMLTableRowElement {
	constructor() {
		super();
		this.append(document.getElementById('geo-row-template').content.cloneNode(true));
		console.log(this.outerHTML);
	}

	toJSON() {
		const {
			longitude,
			latitude,
			altitude,
			heading,
			speed,
			accuarcy,
			dateTime,
		} = this;

		return {
			longitude,
			latitude,
			altitude,
			heading,
			speed,
			accuarcy,
			dateTime: dateTime.toISOString(),
		}
	}

	get longitude() {
		return parseFloat(getSlot('longitude', this).textContent);
	}

	set longitude(value) {
		clearSlotNodes('longitude', this);
		const span = document.createElement('span');
		span.slot = 'longitude';
		span.textContent = value;
		getSlot('longitude', this).append(span);
	}

	get latitude() {
		return parseFloat(getSlot('longitude', this).textContent);
	}

	set latitude(value) {
		clearSlotNodes('latitude', this);
		const slot = getSlot('latitude', this);
		const span = document.createElement('span');
		span.textContent = value;
		slot.append(span);
	}

	get altitude() {
		return parseFloat(getSlotNode('altitude', this).textContent);
	}

	set altitude(value) {
		clearSlotNodes('altitude', this);
		const slot = getSlot('altitude', this);

		if (typeof value === 'number') {
			const span = document.createElement('span');
			span.textContent = (value * 3.28084).toFixes(1);
			span.dataset.after === 'ft';
			slot.append(span);
		}
	}

	get heading() {
		return parseFloat(getSlotNode('heading', this).textContent);
	}

	set heading(value) {
		clearSlotNodes('heading', this);
		const slot = getSlot('heading', this);

		if (typeof heading === 'number') {
			const span = document.createElement('span');
			span.textContent = value;
			span.dataset.after = '°';
			slot.append(span);
		}
	}

	get accuracy() {
		return parseFloat(getSlotNode('accuracy', this).textContent);
	}

	set accuracy(value) {
		clearSlotNodes('accuracy', this);
		const slot = getSlot('accuracy', this);

		if (typeof value === 'number') {
			const span = document.createElement('span');
			span.textContent = (value * 3.28084).toFixed(1);
			span.dataset.after = ' ft';
			slot.append(span);
		}
	}

	get speed() {
		return parseFloat(getSlotNode('speed', this).textContent);
	}

	set speed(value) {
		const slot = getSlot('speed', this);
		clearSlotNodes('speed', this);

		if (typeof value === 'number') {
			const span = document.createElement('span');
			span.textContent = (value * 2.236936).toFixed(1);
			span.dataset.after = ' mph';
			slot.append(span);
		}
	}

	get dateTime() {
		return new Date(getSlotNode('datetime', this).dateTime);
	}

	set dateTime(value) {
		clearSlotNodes('datetime', this);
		const slot = getSlot('datetime', this);
		if (value instanceof Date) {
			const time = document.createElement('time');
			time.textContent = value.toLocaleString();
			time.dateTime = value.toISOString();
			slot.append(time);
		}
	}
}, {
	extends: 'tr',
});
