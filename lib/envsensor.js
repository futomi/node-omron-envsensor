/* ------------------------------------------------------------------
* node-omron-envsensor - envsensor.js
* Date: 2018-05-26
* ---------------------------------------------------------------- */
'use strict';
const EnvsensorDevice = require('./envsensor-device.js');
const EnvsensorAdvertising = require('./envsensor-advertising.js');

/* ------------------------------------------------------------------
* Constructor: Envsensor(params)
* - params:
*     noble  : The Nobel object created by the noble module.
*              This parameter is optional. If you don't specify
*              this parameter, this module automatically creates it.
* ---------------------------------------------------------------- */
const Envsensor = function(params) {
	// Plublic properties
	this.noble = null;
	if(params && 'noble' in params) {
		if(typeof(params['noble']) === 'object') {
			this.noble = params['noble'];
		} else {
			throw new Error('The value of the "noble" property is invalid.');
		}
	} else {
		this.noble = require('noble');
	}
	this.onadvertisement = null;
	this.ondiscover = null;

	// Private properties
	this._devices = {};
	this._discover_status = false;
	this._DISCOVER_WAIT_MAX_MSEC = 60000; // ms
	this._devices = {};
	this._initialized = false;
};

/* ------------------------------------------------------------------
* Method: init()
* ---------------------------------------------------------------- */
Envsensor.prototype.init = function() {
	let promise = new Promise((resolve, reject) => {
		this._initialized = false;
		if(this.noble.state === 'poweredOn') {
			this._initialized = true;
			resolve();
		} else {
			this.noble.once('stateChange', (state) => {
				if(state === 'poweredOn') {
					this._initialized = true;
					resolve();
				} else {
					let err = new Error('Failed to initialize the Noble object: ' + state);
					reject(err);
				}
			});
		}
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: discover([p])
* - p = {
*     duration: 5000, // Duration for discovery process (msec)
*     idFilter: '' // Forward match
*     quick: false
*   }
* ---------------------------------------------------------------- */
Envsensor.prototype.discover = function(p) {
	this._checkInitialized();
	let duration = 5000;
	let id_filter = '';
	let quick = false;
	if(p && typeof(p) === 'object') {
		if(('duration' in p) && typeof(p['duration']) === 'number') {
			duration = p['duration'];
			if(duration < 1000) {
				duration = 1000;
			} else if(duration > this._DISCOVER_WAIT_MAX_MSEC) {
				duration = this._DISCOVER_WAIT_MAX_MSEC;
			}
		}
		if(('idFilter' in p) && typeof(p['idFilter'] === 'string')) {
			id_filter = p['idFilter'];
		}
		if(('quick' in p) && typeof(p['quick'] === 'boolean')) {
			quick = p['quick'];
		}
	}

	let promise = new Promise((resolve, reject) => {
		let timer = null;
		let finishDiscovery = () => {
			if(timer) {
				clearTimeout(timer);
			}
			this.stopScan();
			let device_list = [];
			for(let id in this._devices) {
				device_list.push(this._devices[id]);
			}
			resolve(device_list);
		};
		this._devices = {};
		this.noble.on('discover', (peripheral) => {
			let dev = this._discoveredDevice(peripheral, id_filter);
			if(quick && dev) {
				finishDiscovery();
				return;
			}
		});
		this.noble.startScanning([], false);
		this._discover_status = true;
		timer = setTimeout(() => {
			finishDiscovery();
		}, duration);
	});
	return promise;
};

Envsensor.prototype._checkInitialized = function() {
	if(this._initialized === false) {
		throw new Error('The `init()` method has not been called yet.');
	}
	if(this._discover_status === true) {
		throw new Error('The `discover()` or the `startScan()` method is in progress.');
	}
};

Envsensor.prototype._discoveredDevice = function(peripheral, id_filter) {
	let parsed = EnvsensorAdvertising.parse(peripheral);
	if(parsed) {
		if(id_filter && peripheral.id.indexOf(id_filter) !== 0) { return null; }
		var addr = peripheral.address;
		if(this._devices[addr]) {
			return null;
		}
		let device = new EnvsensorDevice(this.noble, peripheral);
		if(this.ondiscover && typeof(this.ondiscover) === 'function') {
			this.ondiscover(device);
		}
		this._devices[addr] = device;
		return device;
	} else {
		return null;
	}
};

/* ------------------------------------------------------------------
* Method: stopScan()
* ---------------------------------------------------------------- */
Envsensor.prototype.stopScan = function() {
	this.noble.removeAllListeners('discover');
	if(this._discover_status === true) {
		this._discover_status = false;
		this.noble.stopScanning();
	}
};

/* ------------------------------------------------------------------
* Method: startScan([p])
* - p = {
*     idFilter: '' // Forward match
*   }
* ---------------------------------------------------------------- */
Envsensor.prototype.startScan = function(p) {
	this._checkInitialized();
	let id_filter = '';
	if(p && typeof(p) === 'object') {
		if(('idFilter' in p) && typeof(p['idFilter'] === 'string')) {
			id_filter = p['idFilter'];
		}
	}
	this.noble.on('discover', (peripheral) => {
		let parsed = EnvsensorAdvertising.parse(peripheral);
		if(parsed) {
			var ad = peripheral.advertisement;
			if(id_filter && peripheral.id.indexOf(id_filter) !== 0) { return; }
			if(this.onadvertisement && typeof(this.onadvertisement) === 'function') {
				this.onadvertisement(parsed);
			}
		}
	});
	this.noble.startScanning([], true);
	this._discover_status = true;
};

module.exports = Envsensor;
