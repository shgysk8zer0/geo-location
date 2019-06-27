import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import {ready, $} from 'https://cdn.kernvalley.us/js/std-js/functions.js';

document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

ready().then(async () => {
	async function getCoords({
		enableHighAccuracy = true,
		timeout = Infinity,
		maximumAge = 3000,
		max = 10,
	} = {}) {
		return new Promise((resolve, reject) => {
			let entries = [];
			let value = 0;
			$('#progress').attr({max, value: null});
			const pid = navigator.geolocation.watchPosition(({coords, timestamp}) => {
				$('#progress').attr({value});
				const {
					longitude,
					latitude,
					altitude = null,
					heading = null,
					accuracy = null,
					speed = null,
				} = coords;
				const dtime = new Date(timestamp);

				entries.push({
					longitude,
					latitude,
					altitude,
					heading,
					accuracy,
					speed,
					dtime,
				});

				if (++value > max) {
					navigator.geolocation.clearWatch(pid);
					resolve(entries);
				}
			}, err => reject(err), {enableHighAccuracy, timeout, maximumAge});
		});
	}

	$('#button').click(async event => {
		event.target.disabled = true;
		$('.error').text('');

		try {
			$('#progress-dialog').showModal();
			$('#table > tbody > tr').remove();
			$('#table').hide();

			const tmp = document.getElementById('row-template').content;
			const table = document.getElementById('table');
			const tbody = table.tBodies.item(0);
			const entries = await getCoords();
			[...tbody.rows].forEach(row => row.remove());

			const rows = entries.map(({
				longitude,
				latitude,
				altitude = null,
				heading = null,
				speed = null,
				accuracy = null,
				dtime = null,
			}) => {
				const template = tmp.cloneNode(true);
				const m2ft = m => m / 3.28084;
				const mps2mph = v => v / 2.236936;

				$('[data-field="longitude"]', template).text(longitude);
				$('[data-field="latitude"]', template).text(latitude);

				if (typeof altitude === 'number' && ! Number.isNaN(altitude)) {
					$('[data-field="altitude"]', template).text(`${m2ft(altitude).toFixed(2)} ft`);
				}

				if (typeof speed === 'number' && ! Number.isNaN(speed)) {
					$('[data-field="speed"]', template).text(`${mps2mph(speed).toFixed(2)} mph`);
				}

				if (typeof heading === 'number' && ! Number.isNaN(heading)) {
					$('[data-field="heading"]', template).text(`${heading.toFixed(2)}°`);
				}

				if (typeof accuracy === 'number' && ! Number.isNaN(accuracy)) {
					$('[data-field="accuracy"]', template).text(`${m2ft(accuracy).toFixed(2)} ft`);
				}

				if (dtime instanceof Date) {
					$('[data-field="dtime"]', template).text(dtime.toLocaleString());
					$('[data-field="dtime"]', template).attr({datetime: dtime.toISOString()});
				}

				return template;
			});

			tbody.append(...rows);
			$('#table').unhide();
		} catch(err) {
			console.error(err);
			$('.error').text(err.message);
		} finally {
			event.target.disabled = false;
			$('#progress-dialog').close();
		}
	});
});
