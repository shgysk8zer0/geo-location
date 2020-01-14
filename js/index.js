import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import './current-location.js';
import {registerServiceWorker} from 'https://cdn.kernvalley.us/js/std-js/functions.js';

document.documentElement.classList.remove('no-js', 'js');
document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker);
}
