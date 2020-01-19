'use strict';
// 2019-06-11 12:25
const config = {
	version: '1.0.05',
	stale: [
		'/',
		'/js/index.js',
		'/js/current-location.js',
		'/js/current-location.html',
		'/img/icons.svg',
		'https://cdn.kernvalley.us/js/std-js/deprefixer.js',
		'https://cdn.kernvalley.us/js/std-js/shims.js',
		'https://cdn.kernvalley.us/js/current-year.js',
		'https://cdn.kernvalley.us/js/std-js/Notification.js',
		'https://cdn.kernvalley.us/js/std-js/esQuery.js',
		'https://cdn.kernvalley.us/js/std-js/functions.js',
		'https://cdn.kernvalley.us/components/leaflet/map.js',
		'https://cdn.kernvalley.us/components/leaflet/map.html',
		'https://cdn.kernvalley.us/components/leaflet/marker.js',
		'https://cdn.kernvalley.us/components/leaflet/geojson.js',
		'https://cdn.kernvalley.us/components/leaflet/image-overlay.js',
		'https://cdn.kernvalley.us/components/share-button.js',
		'https://cdn.kernvalley.us/components/toast-message.js',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/js/std-js/webShareApi.js',
		'https://cdn.kernvalley.us/js/std-js/share-config.js',
		'https://unpkg.com/leaflet@1.6.0/dist/leaflet-src.esm.js',
		'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css',
		'/css/styles/index.css',
		'/css/styles/vars.css',
		'/css/styles/layout.css',
		'/css/styles/header.css',
		'/css/styles/nav.css',
		'/css/styles/main.css',
		'/css/styles/sidebar.css',
		'/css/styles/footer.css',
		'https://cdn.kernvalley.us/css/core-css/rem.css',
		'https://cdn.kernvalley.us/css/core-css/viewport.css',
		'https://cdn.kernvalley.us/css/core-css/element.css',
		'https://cdn.kernvalley.us/css/core-css/class-rules.css',
		'https://cdn.kernvalley.us/css/core-css/utility.css',
		'https://cdn.kernvalley.us/css/core-css/fonts.css',
		'https://cdn.kernvalley.us/css/core-css/animations.css',
		'https://cdn.kernvalley.us/css/normalize.css/normalize.css',
		'https://cdn.kernvalley.us/css/animate.css/animate.css',
		'https://cdn.kernvalley.us/img/apple-touch-icon.png',
		'/img/favicon.svg',
	].map(path => new URL(path, location.origin).href),
};

self.addEventListener('install', async () => {
	const cache = await caches.open(config.version);
	const keys = await caches.keys();
	const old = keys.filter(k => k !== config.version);
	await Promise.all(old.map(key => caches.delete(key)));

	await cache.addAll(config.stale);
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(async function() {
		self.clients.claim();
	}());
});

self.addEventListener('fetch', async event => {
	async function get(request) {
		const cache = await caches.open(config.version);
		const cached = await cache.match(request);

		return cached instanceof Response ? cached : fetch(request);
	}

	if (event.request.method === 'GET' && config.stale.includes(event.request.url)) {
		event.respondWith(get(event.request));
	}
});
