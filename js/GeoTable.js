import './GeoRow.js';
customElements.define('geo-table', class HTMLGeoTableElement extends HTMLTableElement {
	constructor() {
		super();
		this.append(document.getElementById('geo-table-template').content.cloneNode(true));
	}

	toJSON() {
		return this.rows;
	}

	get tBody() {
		return this.tBodies.item(0);
	}

	get rows() {
		return [...this.tBody.rows];
	}

	set rows(items) {
		const trs = items.map(({
			longitude,
			latitude,
			altitude,
			heading,
			speed,
			accuracy,
			dtime,
		}) => {
			const tr = document.createElement('tr', {is: 'geo-row'});
			tr.longitude = longitude;
			tr.latitude = latitude;
			tr.altitude = altitude;
			tr.heading = heading;
			tr.speed = speed;
			tr.accuracy = accuracy;
			tr.dateTime = dtime;
			return tr;
		});
		this.rows.forEach(tr => tr.remove());
		this.tBody.append(...trs);
	}
}, {
	extends: 'table',
})
