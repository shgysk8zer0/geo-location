const shadows = new WeakMap();
const paths = new WeakMap();
const pids = new WeakMap();

async function set(element, name, value, tag = 'span', attrs = {}) {
	const el = document.createElement(tag);
	el.slot = name;
	el.textContent = value;
	Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
	await clearSlot(element, name);
	element.append(el);
}

async function getSlot(element, name) {
	await element.ready;
	return shadows.get(element).querySelector(`slot[name="${name}"]`);
}

function get(element, name) {
	if (shadows.has(element)) {
		const slot = shadows.get(element).querySelector(`slot[name="${name}"]`);
		if (slot instanceof HTMLElement) {
			const nodes = slot.assignedNodes();
			if (nodes.length === 1) {
				return nodes[0].textContent;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
}

function getGeoJSON(path, generated = new Date()) {
	const obj = {
		type: 'FeatureCollection',
		features: [{
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: path.map(({coords}) => ([coords.longitude, coords.latitude])),
			},
			properties: {generated: generated.toISOString()},
		}],
	};

	return new Blob([JSON.stringify(obj, null, 4)], {type: 'application/geo+json'});
}

async function clearSlot(element, name) {
	const slot = await getSlot(element, name);
	slot.assignedNodes().forEach(el => el.remove());
}

customElements.define('current-location', class HTMLCurrentLocationElement extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'closed'});

		fetch(new URL('./current-location.html', import.meta.url)).then(async resp => {
			const html = await resp.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			shadow.append(...doc.head.children, ...doc.body.children);
			shadows.set(this, shadow);
			this.dispatchEvent(new Event('ready'));
		});
	}

	async connectedCallback() {
		await this.ready;
		const shadow = shadows.get(this);
		shadow.getElementById('start').addEventListener('click', () => this.start());
		shadow.getElementById('stop').addEventListener('click', () => this.stop());
	}

	toJSON() {
		const {latitude, longitude, altitude, heading, speed, accuracy} = this;
		return {latitude, longitude, altitude, heading, speed, accuracy};
	}

	toString() {
		return `${this.latitude}, ${this.longitude}`;
	}

	get ready() {
		return new Promise(resolve => {
			if (shadows.has(this)) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	get accuracy() {
		return parseFloat(get(this, 'accuracy'));
	}

	set accuracy(val) {
		set(this, 'accuracy', val);
	}

	get altitude() {
		return parseFloat(get(this, 'altitude'));
	}

	set altitude(val) {
		set(this, 'altitude', val);
	}

	get heading() {
		return parseFloat(get(this, 'heading'));
	}

	set heading(val) {
		set(this, 'heading', val);
	}

	get latitude() {
		return parseFloat(get(this, 'latitude'));
	}

	set latitude(val) {
		set(this, 'latitude', val);
	}

	get longitude() {
		return parseFloat(get(this, 'longitude'));
	}

	set longitude(val) {
		set(this, 'longitude', val);
	}

	get speed() {
		return parseFloat(get(this, 'speed'));
	}

	set speed(val) {
		set(this, 'speed', val);
	}

	async start() {
		await this.ready;

		if (pids.has(this)) {
			throw new Error('Already running');
		} else {
			const shadow = shadows.get(this);
			shadow.getElementById('download').classList.add('no-pointer-events');
			shadow.getElementById('start').disabled = true;
			shadow.getElementById('stop').disabled = false;
			paths.set(this, []);
			const pid = navigator.geolocation.watchPosition(({coords, timestamp}) => {
				const {
					longitude,
					latitude,
					altitude = null,
					heading = null,
					accuracy = null,
					altitudeAccuracy,
					speed = null,
				} = coords;

				paths.get(this).push({coords: {
					latitude,
					longitude,
					altitude,
					heading,
					accuracy,
					altitudeAccuracy,
					speed,
				}, timestamp: new Date(timestamp).toISOString()});

				this.latitude = latitude;
				this.longitude = longitude;
				this.altitude = altitude;
				this.heading = heading;
				this.speed = speed;
				this.accuracy = accuracy;

			}, console.error, {
				enableHighAccuracy: true,
				timeout: Infinity,
				maximumAge: 3000,
			});

			pids.set(this, pid);
		}
	}

	async stop() {
		await this.ready;
		if (pids.has(this)) {
			const pid = pids.get(this);
			const now = new Date();
			const shadow = shadows.get(this);
			const path = paths.get(this);
			const blob = getGeoJSON(path);
			const download = shadow.getElementById('download');

			if (download.href.startsWith('blob:')) {
				URL.revokeObjectURL(download.href);
			}
			download.href = URL.createObjectURL(blob);
			download.download = `path-${now.toISOString()}.geojson`;
			download.classList.remove('no-pointer-events');
			navigator.geolocation.clearWatch(pid);
			paths.delete(this);
			pids.delete(this);
			this.latitude = '';
			this.longitude = '';
			this.altitude = '';
			this.heading = '';
			this.speed = '';
			this.accuracy = '';
			shadow.getElementById('stop').disabled = true;
			shadow.getElementById('start').disabled = false;
		}
	}
});
