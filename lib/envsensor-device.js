/* ------------------------------------------------------------------
* node-omron-envsensor - envsensor-device.js
* Date: 2018-06-02
* ---------------------------------------------------------------- */
'use strict';
const EnvsensorChars = require('./envsensor-chars.js');

/* ------------------------------------------------------------------
* Constructor: EnvsensorDevice(peripheral)
* - peripheral:
*     A Peripheral object of the noble module
* ---------------------------------------------------------------- */
const EnvsensorDevice = function (noble, peripheral) {
	this.id = peripheral.id;
	this.ondisconnected = null;
	this.onsensordata = null;
	this.oneventflag = null;

	// Private
	this._noble = noble;
	this._peripheral = peripheral;
	this._services = {};
	this._chars = {};
	this._was_clean = false;
	this._onresponse = null;
	this._RESPONSE_TIMEOUT_MSEC = 5000; // msec
	this._REQUEST_RETRY_MAX = 3;
	this._BASE_UUID_RE = /^0c4c([a-f\d]{4})770046f4aa96d5e974e32a54$/;

	this._SERVICE_NAMES = {
		'3000': 'Sensor Service',
		'3010': 'Setting Service',
		'3030': 'Control Service',
		'3040': 'Parameter Service',
		'3050': 'DFU Service'
	};

	this._CHAR_NAMES = {
		// Sensor Service
		'3001': 'Latest data',
		'3002': 'Latest page',
		'3003': 'Request page',
		'3004': 'Response flag',
		'3005': 'Response data',
		'3006': 'Event flag',
		// Setting Service
		'3011': 'Measurement interval',
		'3012': '',
		'3013': 'Temperature',
		'3014': 'Relative humidity',
		'3015': 'Ambient light',
		'3016': 'UV Index',
		'3017': 'Pressure',
		'3018': 'Sound noise',
		'3019': 'Discomfort index',
		'301a': 'Heat stroke',
		// Control Service
		'3031': 'Time information',
		'3032': 'LED on duration',
		'3033': 'Error status',
		'3034': 'Trigger',
		// Parameter Service
		'3041': 'UUIDs',
		'3042': 'ADV setting',
		// DFU Service
		'3053': 'DFU Revision'
	};
};

/* ------------------------------------------------------------------
* Method: isConnected()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.isConnected = function () {
	if (this._peripheral && this._peripheral.state === 'connected') {
		return true;
	} else {
		return false;
	}
};

/* ------------------------------------------------------------------
* Method: connect()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.connect = function () {
	let promise = new Promise((resolve, reject) => {
		if (this.isConnected()) {
			resolve();
		} else {
			var p = this._peripheral;
			p.once('disconnect', () => {
				if (this._isFunction(this.ondisconnected)) {
					this.ondisconnected({ 'wasClean': this._was_clean });
					this._was_clean = false;
				}
			});
			p.connect((error) => {
				if (error) {
					reject(new Error('Failed to connect to the device: ' + error.message));
				} else {
					this._init().then(() => {
						resolve();
					}).catch((error) => {
						this.disconnect().then(() => {
							reject(new Error('Failed to connect to the device: ' + error.message));
						}).catch((e) => {
							reject(new Error('Failed to connect to the device: ' + error.message));
						});
					});
				}
			});
		}
	});
	return promise;
};

EnvsensorDevice.prototype._isFunction = function (o) {
	return (o && typeof (o) === 'function') ? true : false;
};

EnvsensorDevice.prototype._init = function () {
	var p = this._peripheral;
	let promise = new Promise((resolve, reject) => {
		p.discoverAllServicesAndCharacteristics((error, service_list, char_list) => {
			if (error) {
				reject(error);
			} else {
				service_list.forEach((s) => {
					let uuid = s.uuid;
					if (s.uuid.match(this._BASE_UUID_RE)) {
						uuid = RegExp.$1;
					}
					if (!s.name) {
						if (this._SERVICE_NAMES[uuid]) {
							s.name = this._SERVICE_NAMES[uuid];
						}
					}
					this._services[uuid] = s;
				});
				char_list.forEach((c) => {
					let uuid = c.uuid;
					if (c.uuid.match(this._BASE_UUID_RE)) {
						uuid = RegExp.$1;
					}
					if (!c.name) {
						if (this._CHAR_NAMES[uuid]) {
							c.name = this._CHAR_NAMES[uuid];
						}
					}
					this._chars[uuid] = c;
				});
				resolve();
			}
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: disconnect()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.disconnect = function () {
	let promise = new Promise((resolve, reject) => {
		var p = this._peripheral;
		if (this.isConnected()) {
			this._was_clean = true;
			p.disconnect((error) => {
				p.removeAllListeners('disconnect');
				if (error) {
					reject(new Error('Failed to disconnect the device: ' + error.message));
				} else {
					resolve();
				}
			});
		} else {
			resolve();
		}
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getDeviceInfo()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getDeviceInfo = function () {
	let promise = new Promise((resolve, reject) => {
		let info = {};
		this._read('2a00').then((res) => { // Device Name
			info['deviceName'] = res['deviceName'];
			return this._read('2a24'); // Model Number
		}).then((res) => {
			info['modelNumber'] = res['modelNumber'];
			return this._read('2a25'); // Serial Number
		}).then((res) => {
			info['serialNumber'] = res['serialNumber'];
			return this._read('2a26'); // Firmware Revision
		}).then((res) => {
			info['firmwareRevision'] = res['firmwareRevision'];
			return this._read('2a27'); // Hardware Revision
		}).then((res) => {
			info['hardwareRevision'] = res['hardwareRevision'];
			return this._read('2a29'); // Manufacturer Name
		}).then((res) => {
			info['manufacturerName'] = res['manufacturerName'];
			resolve(info);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getBasicConfigurations()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getBasicConfigurations = function () {
	let promise = new Promise((resolve, reject) => {
		let conf = {};
		this.getMeasurementInterval().then((res) => {
			conf['measurementInterval'] = res['measurementInterval'];
			return this.getAdvSetting();
		}).then((res) => {
			conf['beaconMode'] = res['beaconMode'];
			conf['txPowerLevel'] = res['txPowerLevel'];
			return this.getUuid();
		}).then((res) => {
			conf['uuid'] = res['uuid'];
			resolve(conf);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: setBasicConfigurations(params)
* - params                | object  | required |
*   - measurementInterval | integer | optional | Measurement interval. 1 - 3600 (sec). The default is 300 sec.
*   - beaconMode          | integer | optional | Beacon Mode. The value must be 0, 1, 2, 3, 4, 5, 7, or 8. The default is 8.
*   - txPowerLevel        | integer | optional | Tx Power. The value must be -20, -16, -12, -8, -4, 0, or 4. The default is 0.
*   - uuid                | string  | optional | UUID. The default is "0C4C3000-7700-46F4-AA96D5E974E32A54".
*
*   - At least one parameter is required.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setBasicConfigurations = function (params) {
	let promise = new Promise((resolve, reject) => {
		let p = {};
		this.getBasicConfigurations().then((res) => {
			for (let k in res) {
				p[k] = (k in params) ? params[k] : res[k];
			}
			return this.setMeasurementInterval({
				measurementInterval: p['measurementInterval']
			});
		}).then(() => {
			return this.setUuid({
				uuid: p['uuid']
			});
		}).then(() => {
			return this.setAdvSetting({
				beaconMode: p['beaconMode'],
				txPowerLevel: p['txPowerLevel']
			});
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getRecordingStatus()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getRecordingStatus = function () {
	let promise = new Promise((resolve, reject) => {
		let data = {};
		this.getAdvSetting().then((res) => {
			data['beaconMode'] = res['beaconMode'];
			return this.getTime();
		}).then((res) => {
			data['isRecording'] = false;
			let mode = data['beaconMode'];
			if (res['unixTime'] > 0 && /^(0|1|7|8)$/.test(mode.toString())) {
				data['isRecording'] = true;
			}
			return this.getLatestPage();
		}).then((res) => {
			data['page'] = res['page'];
			data['row'] = res['row'];
			data['measurementInterval'] = res['measurementInterval'];
			data['unixTime'] = res['unixTime'];
			resolve(data);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: startRecording()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.startRecording = function () {
	let promise = new Promise((resolve, reject) => {
		let mode = -1;
		this.getRecordingStatus().then((res) => {
			if (res['isRecording'] === true) {
				resolve();
			} else {
				mode = res['beaconMode'];
				if (!/^(0|1|7|8)$/.test(mode.toString())) {
					mode = 8;
				}
				return this.setAdvSetting({ beaconMode: mode });
			}
		}).then(() => {
			return this.setTime();
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: stopRecording()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.stopRecording = function () {
	let promise = new Promise((resolve, reject) => {
		let mode = -1;
		this.getRecordingStatus().then((res) => {
			if (res['isRecording'] === false) {
				resolve();
			} else {
				mode = res['beaconMode'];
				return this.setAdvSetting({ beaconMode: 2 });
			}
		}).then(() => {
			return this.setAdvSetting({ beaconMode: mode });
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getRecordedDataList([params])
* - params | object  | optional |
*   - page | integer | optional | Page number in the flash memory. 0 - 2047.
*
* - If the `page` is not specified, the latest page is applied.
* - If the data recording mode has been started, this method rejects.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getRecordedDataList = function (params) {
	let promise = new Promise((resolve, reject) => {
		let p = null;
		if (params && typeof (params) === 'object' && 'page' in params) {
			let page = params['page'];
			if (typeof (page) !== 'number' || page % 1 !== 0 || page < 0 || page > 2047) {
				reject(new Error('The page must be an integer in the range of 0 to 2047.'));
				return;
			}
			p = { page: page };
		}

		let target_page = 0;
		let interval = 0;

		this.getRecordingStatus().then((res) => {
			if (res['isRecording'] === false) {
				throw new Error('The data recording mode has not been started.');
			} else {
				return this._getTargetPageAndRow(p);
			}
		}).then((res) => {
			target_page = res['page'];
			interval = res['interval'];
			return this._getRecordedDataListFromPages(res);
		}).then((data_list) => {
			resolve({
				page: target_page,
				measurementInterval: interval,
				dataList: data_list
			});
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnvsensorDevice.prototype._getTargetPageAndRow = function (p) {
	let promise = new Promise((resolve, reject) => {
		let page = 0;
		let row = 12;
		this.getLatestPage().then((res) => {
			let interval = res['measurementInterval'];
			if (p) {
				page = p['page'];
				if (res['page'] === p['page']) {
					row = res['row'];
				} else {
					row = 12;
				}
			} else {
				page = res['page'];
				row = res['row'];
			}
			resolve({ page: page, row: row, interval: interval });
		}).catch((error) => {
			reject(error);
		})
	});
	return promise;
};

EnvsensorDevice.prototype._getRecordedDataListFromPages = function (p) {
	let page = p['page'];
	let row = p['row'];
	let interval = p['interval'];
	let time = 0;
	let promise = new Promise((resolve, reject) => {
		this.setRequestPage({ page: page, row: row }).then(() => {
			return this._wait(200);
		}).then(() => {
			return this.getResponseFlag();
		}).then((res) => {
			if (res['updateFlag'] !== 0x01) {
				throw new Error('Failed to set the request page (updateFlag=' + res['updateFlag'] + ').');
			}
			time = res['unixTime'];
			return this._wait(100);
		}).then(() => {
			return this._getRecordedSensorDataListFromCurrentPage();
		}).then((data_list) => {
			data_list.forEach((d) => {
				d['unixTime'] = time;
				d['timeStamp'] = this._getTimeStampFromUnixTime(time);
				time += interval;
			});
			resolve(data_list);
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnvsensorDevice.prototype._getTimeStampFromUnixTime = function (unix_time) {
	let dt = new Date(unix_time * 1000);
	let ymd = [
		dt.getFullYear().toString(),
		('0' + (dt.getMonth() + 1)).slice(-2),
		('0' + dt.getDate()).slice(-2)
	];
	let hms = [
		('0' + dt.getHours()).slice(-2),
		('0' + dt.getMinutes()).slice(-2),
		('0' + dt.getSeconds()).slice(-2)
	];
	let tzo = dt.getTimezoneOffset();
	let tz = 'Z';
	if (tzo !== 0) {
		let tzh = Math.floor(Math.abs(tzo) / 60);
		let tzm = Math.abs(tzo) % 60;
		let tzs = (tzo > 0) ? '-' : '+';
		tz = tzs + ('0' + tzh).slice(-2) + ':' + ('0' + tzm).slice(-2);
	}
	// ISO 8601
	let ts = ymd.join('-') + 'T' + hms.join(':') + tz;
	return ts;
};

EnvsensorDevice.prototype._wait = function (msec) {
	let promise = new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, msec);
	});
	return promise;
};

EnvsensorDevice.prototype._getRecordedSensorDataListFromCurrentPage = function () {
	let promise = new Promise((resolve, reject) => {
		let data_list = [];
		let getData = (callback) => {
			this.getResponseData().then((res) => {
				if (res['row'] > 12) {
					setTimeout(() => {
						callback();
					}, 10);
				} else {
					data_list.unshift(res);
					setTimeout(() => {
						getData(callback);
					}, 10);
				}
			}).catch((error) => {
				callback(error);
			});
		};
		getData((error) => {
			if (error) {
				reject(error);
			} else {
				resolve(data_list);
			}
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getLatestData()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getLatestData = function () {
	return this._readValue('3001');
};

/* ------------------------------------------------------------------
* Method: startMonitoringData()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.startMonitoringData = function (params) {
	let promise = new Promise((resolve, reject) => {
		let char_uuid = '3001';
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('The characteristic UUID `' + char_uuid + '` is not supported.'));
			return;
		}
		char.subscribe((error) => {
			if (error) {
				reject(error);
				return;
			}
			char.on('data', (buf) => {
				if (!this._isFunction(this.onsensordata)) {
					return;
				}
				let parsed = EnvsensorChars.parseResponse(char_uuid, buf);
				if (parsed) {
					this.onsensordata(parsed);
				}
			});
			resolve();
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: stopMonitoringData()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.stopMonitoringData = function () {
	let promise = new Promise((resolve, reject) => {
		let char_uuid = '3001';
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('The characteristic UUID `' + char_uuid + '` is not supported.'));
			return;
		}
		char.unsubscribe((error) => {
			if (error) {
				reject(error);
			} else {
				char.removeAllListeners('data');
				resolve();
			}
		});
	});
	return promise;
};

/* ##################################################################
* Low level methods
* ################################################################ */

/* ------------------------------------------------------------------
* Method: getLatestPage()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getLatestPage = function () {
	return this._readValue('3002');
};

/* ------------------------------------------------------------------
* Method: getRequestPage()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getRequestPage = function () {
	return this._readValue('3003');
};

/* ------------------------------------------------------------------
* Method: setRequestPage(params)
* - params | object  | required |
*   - page | integer | optional | Requesting Page No. 0 - 2047.
*   - row  | integer | optional | Requesting Row No. 0 - 12.
*
* - At least one parameter is required.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setRequestPage = function (params) {
	return this._setValue('3003', params);
};

/* ------------------------------------------------------------------
* Method: getResponseFlag()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getResponseFlag = function () {
	return this._readValue('3004');
};

/* ------------------------------------------------------------------
* Method: getResponseData()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getResponseData = function () {
	return this._readValue('3005');
};

/* ------------------------------------------------------------------
* Method: startMonitoringEventFlag()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.startMonitoringEventFlag = function (params) {
	let promise = new Promise((resolve, reject) => {
		let char_uuid = '3006';
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('The characteristic UUID `' + char_uuid + '` is not supported.'));
			return;
		}
		char.subscribe((error) => {
			if (error) {
				reject(error);
				return;
			}
			char.on('data', (buf) => {
				if (!this._isFunction(this.oneventflag)) {
					return;
				}
				let parsed = EnvsensorChars.parseResponse(char_uuid, buf);
				if (parsed) {
					this.oneventflag(parsed);
				}
			});
			resolve();
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: stopMonitoringEventFlag()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.stopMonitoringEventFlag = function () {
	let promise = new Promise((resolve, reject) => {
		let char_uuid = '3006';
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('The characteristic UUID `' + char_uuid + '` is not supported.'));
			return;
		}
		char.unsubscribe((error) => {
			if (error) {
				reject(error);
			} else {
				char.removeAllListeners('data');
				resolve();
			}
		});
	});
	return promise;
};

/* ------------------------------------------------------------------
* Method: getEventFlag()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventFlag = function () {
	return this._readValue('3006');
};

/* ------------------------------------------------------------------
* Method: getMeasurementInterval()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getMeasurementInterval = function () {
	return this._readValue('3011');
};

/* ------------------------------------------------------------------
* Method: setMeasurementInterval(params)
* - params                | object  | required |
*   - measurementInterval | integer | required | Measurement interval. 1 - 3600 (sec). The default is 300 sec.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setMeasurementInterval = function (params) {
	return this._setValue('3011', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsTemperature()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsTemperature = function () {
	return this._readValue('3013');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsTemperature(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsTemperature = function (params) {
	return this._setValue('3013', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsHumidity()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsHumidity = function () {
	return this._readValue('3014');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsHumidity(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsHumidity = function (params) {
	return this._setValue('3014', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsAmbientlight()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsAmbientlight = function () {
	return this._readValue('3015');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsAmbientlight(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsAmbientlight = function (params) {
	return this._setValue('3015', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsUvIndex()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsUvIndex = function () {
	return this._readValue('3016');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsUvIndex(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsUvIndex = function (params) {
	return this._setValue('3016', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsPressure()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsPressure = function () {
	return this._readValue('3017');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsPressure(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsPressure = function (params) {
	return this._setValue('3017', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsSoundNoise()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsSoundNoise = function () {
	return this._readValue('3018');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsSoundNoise(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsSoundNoise = function (params) {
	return this._setValue('3018', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsDiscomfortIndex()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsDiscomfortIndex = function () {
	return this._readValue('3019');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsDiscomfortIndex(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsDiscomfortIndex = function (params) {
	return this._setValue('3019', params);
};

/* ------------------------------------------------------------------
* Method: getEventSettingsHeatStroke()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getEventSettingsHeatStroke = function () {
	return this._readValue('301a');
};

/* ------------------------------------------------------------------
* Method: setEventSettingsHeatStroke(params)
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setEventSettingsHeatStroke = function (params) {
	return this._setValue('301a', params);
};

/* ------------------------------------------------------------------
* Method: getTime()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getTime = function () {
	return this._readValue('3031');
};

/* ------------------------------------------------------------------
* Method: setTime([params])
* - params      | object  | optional |
*   - unixTime  | integer | optional | UNIX TIME.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setTime = function (params) {
	let p = { unixTime: Math.ceil(Date.now() / 1000) };
	if (params && 'unixTime' in params) {
		p = { unixTime: params['unixTime'] };
	}
	return this._write('3031', p);
};

/* ------------------------------------------------------------------
* Method: turnOnLed([params])
* - params      | object  | optional |
*   - duration  | integer | optional | LED on duration. 1 - 10 sec. The default is 3 sec.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.turnOnLed = function (params) {
	let dur = 3;
	if (params && typeof (params) === 'object' && ('duration' in params)) {
		dur = params['duration'];
	}
	return this._write('3032', { duration: dur });
};

/* ------------------------------------------------------------------
* Method: getErrorStatus()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getErrorStatus = function () {
	return this._readValue('3033');
};

/* ------------------------------------------------------------------
* Method: resetErrorStatus()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.resetErrorStatus = function () {
	return this._write('3033');
};

/* ------------------------------------------------------------------
* Method: getUuid()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getUuid = function () {
	return this._readValue('3041');
};

/* ------------------------------------------------------------------
* Method: setUuid(params)
* - params  | object  | required |
*   - uuid  | string  | required | UUID. The default is "0C4C3000-7700-46F4-AA96D5E974E32A54".
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setUuid = function (params) {
	return this._setValue('3041', params);
};

/* ------------------------------------------------------------------
* Method: getAdvSetting()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getAdvSetting = function () {
	return this._readValue('3042');
};

/* ------------------------------------------------------------------
* Method: setAdvSetting(params)
* - params               | object  | required |
*   - indInterval        | integer | optional | ADV_IND Advertise interval.
*                        |         |          | The value must be in the range of 500 to 10240 (msec). The default is 1285 ms.
*   - nonconIndInterval  | integer | optional | ADV_NONCON_IND Advertise interval.
*                        |         |          | The value must be in the range of 100 to 10240 (msec). The default is 100 ms.
*   - transmissionPeriod | integer | optional | Transmission period in Limited Broadcaster.
*                        |         |          | The value must be in the range of 1 to 16383 (sec). The default is 10 sec.
*   - silentPeriod       | integer | optional | Silent period in Limited Broadcaster.
*                        |         |          | The value must be in the range of 1 to 16383 (sec). The default is 50 sec.
*   - beaconMode         | integer | optional | Beacon Mode. The value must be 0, 1, 2, 3, 4, 5, 7, or 8. The default is 8.
*   - txPowerLevel       | integer | optional | Tx Power. The value must be -20, -16, -12, -8, -4, 0, or 4. The default is 0.
*
*   - At least one parameter is required.
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.setAdvSetting = function (params) {
	return this._setValue('3042', params);
};

/* ------------------------------------------------------------------
* Method: getDfuRevision()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getDfuRevision = function () {
	return this._readValue('3053');
};

/* ------------------------------------------------------------------
* Method: getDeviceName()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getDeviceName = function () {
	return this._readValue('2a00');
};

/* ------------------------------------------------------------------
* Method: getAppearance()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getAppearance = function () {
	return this._readValue('2a01');
};

/* ------------------------------------------------------------------
* Method: getConnectionParameters()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getConnectionParameters = function () {
	return this._readValue('2a04');
};

/* ------------------------------------------------------------------
* Method: getModelNumber()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getModelNumber = function () {
	return this._readValue('2a24');
};

/* ------------------------------------------------------------------
* Method: getSerialNumber()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getSerialNumber = function () {
	return this._readValue('2a25');
};

/* ------------------------------------------------------------------
* Method: getFirmwareRevision()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getFirmwareRevision = function () {
	return this._readValue('2a26');
};

/* ------------------------------------------------------------------
* Method: getHardwareRevision()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getHardwareRevision = function () {
	return this._readValue('2a27');
};

/* ------------------------------------------------------------------
* Method: getManufacturerName()
* ---------------------------------------------------------------- */
EnvsensorDevice.prototype.getManufacturerName = function () {
	return this._readValue('2a29');
};

/* ##################################################################
* Private methods
* ################################################################ */

EnvsensorDevice.prototype._readValue = function (char_uuid) {
	return this._read(char_uuid);
};

EnvsensorDevice.prototype._setValue = function (char_uuid, params) {
	let promise = new Promise((resolve, reject) => {
		if (!params || typeof (params) !== 'object' || Object.keys(params).length === 0) {
			reject(new Error('No parameter was specified.'));
			return;
		}

		let override_num = 0;
		let overrideObject = (base, obj) => {
			Object.keys(base).forEach((k) => {
				if (k in obj) {
					let v = obj[k];
					if (typeof (v) === 'object') {
						overrideObject(base[k], v);
					} else {
						base[k] = v;
						override_num++;
					}
				}
			});
		};

		let p = null;
		this._read(char_uuid).then((res) => {
			p = res;
			overrideObject(p, params)
			if (override_num === 0) {
				throw new Error('No parameter was specified.');
			}
			return this._write(char_uuid, p);
		}).then(() => {
			resolve();
		}).catch((error) => {
			reject(error);
		});
	});
	return promise;
};

EnvsensorDevice.prototype._read = function (char_uuid) {
	let promise = new Promise((resolve, reject) => {
		if (typeof (char_uuid) === 'string') {
			char_uuid = char_uuid.toLocaleLowerCase();
		} else if (typeof (char_uuid) === 'number') {
			char_uuid = char_uuid.toString(16);
		} else {
			reject(new Error('Unknown characteristic'));
			return;
		}
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('Unknown characteristic'));
			return;
		}

		let n = 0;
		let readData = (callback) => {
			n++;
			let timer = setTimeout(() => {
				if (n < this._REQUEST_RETRY_MAX) {
					readData(callback);
				} else {
					timer = null;
					callback(new Error('Timeout.'));
				}
			}, this._RESPONSE_TIMEOUT_MSEC);

			char.read((error, buf) => {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				if (error) {
					callback(error);
				} else {
					let parsed = EnvsensorChars.parseResponse(char_uuid, buf);
					if (parsed) {
						callback(null, parsed);
					} else {
						callback(new Error('Unknown Response Data'));
					}
				}
			});
		};
		readData((error, res) => {
			if (error) {
				reject(error);
			} else {
				resolve(res);
			}
		});
	});
	return promise;
};

EnvsensorDevice.prototype._write = function (char_uuid, data, without_response) {
	without_response = without_response ? true : false;
	let promise = new Promise((resolve, reject) => {
		if (typeof (char_uuid) === 'string') {
			char_uuid = char_uuid.toLocaleLowerCase();
		} else if (typeof (char_uuid) === 'number') {
			char_uuid = char_uuid.toString(16);
		} else {
			reject(new Error('Unknown characteristic'));
			return;
		}
		let char = this._chars[char_uuid];
		if (!char) {
			reject(new Error('Unknown characteristic'));
			return;
		}
		let res = EnvsensorChars.createWriteBuffer(char_uuid, data);
		if (res) {
			if (res['error']) {
				reject(res['error']);
			} else {
				let n = 0;
				let writeData = (callback) => {
					n++;
					let timer = setTimeout(() => {
						if (n < this._REQUEST_RETRY_MAX) {
							writeData(callback);
						} else {
							timer = null;
							callback(new Error('Timeout.'));
						}
					}, this._RESPONSE_TIMEOUT_MSEC);

					char.write(res['buffer'], without_response, (error) => {
						if (timer) {
							clearTimeout(timer);
							timer = null;
						}
						if (error) {
							callback(error);
						} else {
							callback(null);
						}
					});
				};
				writeData((error, res) => {
					if (error) {
						reject(error);
					} else {
						resolve(res);
					}
				});
			}
		} else {
			reject(new Error('The characteristic does not support `Write`.'));
		}
	});
	return promise;
};

module.exports = EnvsensorDevice;
