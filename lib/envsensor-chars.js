/* ------------------------------------------------------------------
* node-omron-envsensor- envsensor-chars.js
* Date: 2018-05-31
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: EnvsensorChars()
* ---------------------------------------------------------------- */
const EnvsensorChars = function() {
	// Private
	this._THRESHOLD_RANGES = {
		'3013': { // Temperature 
			'risePrevious'    : { min: 0.01, max: 30.00 },
			'declinePrevious' : { min: 0.01, max: 30.00 },
			'riseTerm'        : { min: 0.01, max: 30.00 },
			'declineTerm'     : { min: 0.01, max: 30.00 },
			'upperLimit'      : { min: -10.00, max: 60.00 },
			'lowerLimit'      : { min: -10.00, max: 60.00 }
		},
		'3014': { // Humidity  
			'risePrevious'    : { min: 0.01, max: 50.00 },
			'declinePrevious' : { min: 0.01, max: 50.00 },
			'riseTerm'        : { min: 0.01, max: 50.00 },
			'declineTerm'     : { min: 0.01, max: 50.00 },
			'upperLimit'      : { min: 0.00, max: 100.00 },
			'lowerLimit'      : { min: 0.00, max: 100.00 }
		},
		'3015': { // Ambient light  
			'risePrevious'    : { min: 1, max: 2000 },
			'declinePrevious' : { min: 1, max: 2000 },
			'riseTerm'        : { min: 1, max: 2000 },
			'declineTerm'     : { min: 1, max: 2000 },
			'upperLimit'      : { min: 10, max: 10000 },
			'lowerLimit'      : { min: 10, max: 10000 }
		},
		'3016': { // UV Index
			'risePrevious'    : { min: 0.00, max: 11.00 },
			'declinePrevious' : { min: 0.00, max: 11.00 },
			'riseTerm'        : { min: 0.00, max: 11.00 },
			'declineTerm'     : { min: 0.00, max: 11.00 },
			'upperLimit'      : { min: 0.00, max: 11.00 },
			'lowerLimit'      : { min: 0.00, max: 11.00 }
		},
		'3017': { // Pressure 
			'risePrevious'    : { min: 0.1, max: 200.0 },
			'declinePrevious' : { min: 0.1, max: 200.0 },
			'riseTerm'        : { min: 0.1, max: 200.0 },
			'declineTerm'     : { min: 0.1, max: 200.0 },
			'upperLimit'      : { min: 700.0, max: 1100.0 },
			'lowerLimit'      : { min: 700.0, max: 1100.0 }
		},
		'3018': { // Sound Noise 
			'risePrevious'    : { min: 0.01, max: 50.00 },
			'declinePrevious' : { min: 0.01, max: 50.00 },
			'riseTerm'        : { min: 0.01, max: 50.00 },
			'declineTerm'     : { min: 0.01, max: 50.00 },
			'upperLimit'      : { min: 40.00, max: 85.00 },
			'lowerLimit'      : { min: 40.00, max: 85.00 }
		},
		'3019': { // Discomfort index
			'risePrevious'    : { min: 0.01, max: 50.00 },
			'declinePrevious' : { min: 0.01, max: 50.00 },
			'riseTerm'        : { min: 0.01, max: 50.00 },
			'declineTerm'     : { min: 0.01, max: 50.00 },
			'upperLimit'      : { min: 55.00, max: 85.00 },
			'lowerLimit'      : { min: 40.00, max: 85.00 }
		},
		'301a': { // Heat stroke
			'risePrevious'    : { min: 0.01, max: 30.00 },
			'declinePrevious' : { min: 0.01, max: 30.00 },
			'riseTerm'        : { min: 0.01, max: 30.00 },
			'declineTerm'     : { min: 0.01, max: 30.00 },
			'upperLimit'      : { min: 25.00, max: 40.00 },
			'lowerLimit'      : { min: 25.00, max: 40.00 }
		}
	};
};

/* ------------------------------------------------------------------
* Method: parseResponse(char_uuid, buf)
* ---------------------------------------------------------------- */
EnvsensorChars.prototype.parseResponse = function(char_uuid, buf) {
	/* ------------------------------------------------
	* Sensor Service
	* ---------------------------------------------- */
	if(char_uuid === '3001') {
		// Sensor Service: Latest data (3001)
		return this._parseSensorLatestData(buf);
	} else if(char_uuid === '3002') {
		// Sensor Service: Latest page (3002)
		return this._parseSensorLatestPage(buf);
	} else if(char_uuid === '3003') {
		// Sensor Service: Request page (3003)
		return this._parseSensorRequestPage(buf);
	} else if(char_uuid === '3004') {
		// Sensor Service: Response flag (3004)
		return this._parseSensorResponseFlag(buf);
	} else if(char_uuid === '3005') {
		// Sensor Service: Response data (3005)
		return this._parseSensorResponseData(buf);
	} else if(char_uuid === '3006') {
		// Sensor Service: Event flag (3006)
		return this._parseSensorEventFlag(buf);
	/* ------------------------------------------------
	* Setting Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3011') {
		// Setting Service: Measurement interval (3011)
		return this._parseSettingMeasurementInterval(buf);
	} else if(char_uuid.match(/^(3013|3014|3015|3016|3017|3018|3019|301a)$/)) {
		// Setting Service: Temperature (3013)
		// Setting Service: Relative humidity (3014)
		// Setting Service: Ambient light (3015)
		// Setting Service: UV index (3016)
		// Setting Service: Pressure (3017)
		// Setting Service: Sound noise (3018)
		// Setting Service: Discomfort index (3019)
		// Setting Service: Heat stroke
		return this._parseEventSetting(char_uuid, buf);
	/* ------------------------------------------------
	* Control Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3031') {
		// Control Service: Time information (3031)
		return this._parseControlTimeInformation(buf);
	} else if(char_uuid === '3033') {
		// Control Service: Error status (3033)
		return this._parseControlErrorStatus(buf);
	/* ------------------------------------------------
	* Parameter Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3041') {
		// Parameter Service: UUIDs (3041)
		return this._parseParameterUuids(buf);
	} else if(char_uuid === '3042') {
		// Parameter Service: ADV setting (3042)
		return this._parseParameterAdvSetting(buf);
	/* ------------------------------------------------
	* DFU Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3053') {
		// DFU Service: DFU Revision
		return this._parseDfuRevision(buf);
	/* ------------------------------------------------
	* Generic Access Service
	* ---------------------------------------------- */
	} else if(char_uuid === '2a00') {
		// Generic Access Service: Device Name (2a00)
		return this._parseGenericAccessDeviceName(buf);
	} else if(char_uuid === '2a01') {
		// Generic Access Service: Appearance (2a01)
		return this._parseGenericAccessAppearance(buf);
	} else if(char_uuid === '2a04') {
		// Generic Access Service: Peripheral Preferred Connection Parameters (2a04)
		return this._parseGenericAccessConnectionParameters(buf);
	/* ------------------------------------------------
	* Device Information Service
	* ---------------------------------------------- */
	} else if(char_uuid === '2a24') {
		// Device Information Service: Model Number String (2a24)
		return this._parseDeviceInformationModelNumber(buf);
	} else if(char_uuid === '2a25') {
		// Device Information Service: Serial Number String (2a25)
		return this._parseDeviceInformationSerialNumber(buf);
	} else if(char_uuid === '2a26') {
		// Device Information Service: Firmware Revision String (2a26)
		return this._parseDeviceInformationFirmwareRevision(buf);
	} else if(char_uuid === '2a27') {
		// Device Information Service: Hardware Revision String (2a27)
		return this._parseDeviceInformationHardwareRevision(buf);
	} else if(char_uuid === '2a29') {
		// Device Information Service: Manufacturer Name String (2a29)
		return this._parseDeviceInformationManufacturerName(buf);
	} else {
		return null;
	}
};

// Sensor Service: Latest data (3001)
EnvsensorChars.prototype._parseSensorLatestData = function(buf) {
	if(buf.length !== 19) {
		return null;
	}
	return {
		row             : buf.readUInt8(0),
		temperature     : buf.readInt16LE(1)   / 100, // degC
		humidity        : buf.readInt16LE(3)   / 100, // %RH
		ambientLight    : buf.readInt16LE(5),         // lx
		uvIndex         : buf.readInt16LE(7)   / 100, // 
		pressure        : buf.readInt16LE(9)   / 10,  // hPa
		soundNoise      : buf.readInt16LE(11)  / 100, // dB
		discomfortIndex : buf.readInt16LE(13)  / 100, // 
		heatStroke      : buf.readInt16LE(15)  / 100, // degC
		batteryVoltage  : buf.readUInt16LE(17)        // mV
	};
};

// Sensor Service: Latest page (3002)
EnvsensorChars.prototype._parseSensorLatestPage = function(buf) {
	if(buf.length !== 9) {
		return null;
	}
	return {
		unixTime            : buf.readUInt32LE(0),
		measurementInterval : buf.readUInt16LE(4), // sec
		page                : buf.readUInt16LE(6),
		row                 : buf.readUInt8(8)
	};
};

// Sensor Service: Request page (3003)
EnvsensorChars.prototype._parseSensorRequestPage = function(buf) {
	if(buf.length !== 3) {
		return null;
	}
	return {
		page: buf.readUInt16LE(0),
		row: buf.readUInt8(2)
	};
};

// Sensor Service: Response flag (3004)
EnvsensorChars.prototype._parseSensorResponseFlag = function(buf) {
	if(buf.length !== 5) {
		return null;
	}
	return {
		updateFlag : buf.readUInt8(0),
		unixTime   : buf.readUInt32LE(1)
	};
};

// Sensor Service: Response data (3005)
EnvsensorChars.prototype._parseSensorResponseData = function(buf) {
	if(buf.length !== 19) {
		return null;
	}
	return {
		row             : buf.readUInt8(0),
		temperature     : buf.readInt16LE(1)   / 100, // degC
		humidity        : buf.readInt16LE(3)   / 100, // %RH
		ambientLight    : buf.readInt16LE(5),         // lx
		uvIndex         : buf.readInt16LE(7)   / 100, // 
		pressure        : buf.readInt16LE(9)   / 10,  // hPa
		soundNoise      : buf.readInt16LE(11)  / 100, // dB
		discomfortIndex : buf.readInt16LE(13)  / 100, // 
		heatStroke      : buf.readInt16LE(15)  / 100, // degC
		batteryVoltage  : buf.readUInt16LE(17)        // mV
	};
};

// Sensor Service: Event flag (3006)
EnvsensorChars.prototype._parseSensorEventFlag = function(buf) {
	if(buf.length !== 9) {
		return null;
	}
	let res = {};
	[
		'temperature',
		'humidity',
		'ambientLight',
		'uvIndex',
		'pressure',
		'soundNoise',
		'discomfortIndex',
		'heatStroke'
	].forEach((pname, offset) => {
		let n = buf.readUInt8(offset);
		res[pname] = {
			lowerLimit      : (n & 0b00100000) ? true : false,
			upperLimit      : (n & 0b00010000) ? true : false,
			declineTerm     : (n & 0b00001000) ? true : false,
			riseTerm        : (n & 0b00000100) ? true : false,
			declinePrevious : (n & 0b00000010) ? true : false,
			risePrevious    : (n & 0b00000001) ? true : false
		};
	});
	res['others'] = {
		batteryReplacement: buf.readUInt8(8) & 0b00000001 ? true : false
	};
	return res;
};

// Setting Service: Measurement interval (3011)
EnvsensorChars.prototype._parseSettingMeasurementInterval = function(buf) {
	if(buf.length !== 2) {
		return null;
	}
	return {
		measurementInterval : buf.readUInt16LE(0) // sec
	};
};

// Setting Service:
// - Temperature (3013)
// - Relative humidity (3014)
// - Ambient light (3015)
// - UV index (3016)
// - Pressure (3017)
// - Sound noise (3018)
// - Discomfort index (3019)
// - Heat stroke (301a)
EnvsensorChars.prototype._parseEventSetting = function(char_uuid, buf) {
	if(buf.length !== 15) {
		return null;
	}
	let div = 1;
	if(char_uuid.match(/^(3013|3014|3016|3018|3019|301a)$/)) {
		div = 100;
	} else if(char_uuid.match(/^(3017)$/)) {
		div = 10;
	}

	let n = buf.readUInt8(0);
	return {
		lowerLimit : {
			enabled   : (n & 0b00100000) ? true : false,
			threshold : buf.readInt16LE(11) / div
		},
		upperLimit : {
			enabled   : (n & 0b00010000) ? true : false,
			threshold : buf.readInt16LE(9)  / div
		},
		declineTerm : {
			enabled   : (n & 0b00001000) ? true : false,
			threshold : buf.readInt16LE(7)  / div
		},
		riseTerm : {
			enabled   : (n & 0b00000100) ? true : false,
			threshold : buf.readInt16LE(5)  / div
		},
		declinePrevious : {
			enabled   : (n & 0b00000010) ? true : false,
			threshold : buf.readInt16LE(3)  / div
		},
		risePrevious : {
			enabled   : (n & 0b00000001) ? true : false,
			threshold : buf.readInt16LE(1)  / div
		},
		measurements    : buf.readUInt8(13),
		movingAverage   : buf.readUInt8(14)
	};
};

// Control Service: Time information (3031)
EnvsensorChars.prototype._parseControlTimeInformation = function(buf) {
	if(buf.length !== 4) {
		return null;
	}
	return {
		unixTime: buf.readUInt32LE(0) // sec
	};
};

// Control Service: Error status (3033)
EnvsensorChars.prototype._parseControlErrorStatus = function(buf) {
	if(buf.length !== 4) {
		return null;
	}
	// Sensor Status
	let n0 = buf.readUInt8(0);
	let sensor = {
		accelerometer: (n0 & 0b01000000) ? true : false,
		microphone   : (n0 & 0b00100000) ? true : false,
		pressure     : (n0 & 0b00010000) ? true : false,
		uv           : (n0 & 0b00001000) ? true : false,
		light        : (n0 & 0b00000100) ? true : false,
		humidity     : (n0 & 0b00000010) ? true : false,
		temperature  : (n0 & 0b00000001) ? true : false
	};
	// CPU Status
	let n1 = buf.readUInt8(1);
	let cpu = {
		boot  : (n1 & 0b00000010) ? true : false,
		flash : (n1 & 0b00000001) ? true : false
	};
	// Battery Status
	let n2 = buf.readUInt8(2);
	let battery = {
		read : (n2 & 0b00000010) ? true : false,
		low  : (n2 & 0b00000001) ? true : false
	};
	//
	return {
		sensor  : sensor,
		cpu     : cpu,
		battery : battery
	};
};

// Parameter Service: UUIDs (3041)
EnvsensorChars.prototype._parseParameterUuids = function(buf) {
	if(buf.length !== 20) {
		return null;
	}
	let h = buf.slice(0, 16).toString('hex').toUpperCase();
	let uuid = [h.substr(0, 8), h.substr(8, 4), h.substr(12, 4), h.substr(16)].join('-');
	return {
		uuid: uuid,
		major: buf.readUInt16BE(16),
		minor: buf.readUInt16BE(18)
	};
};

// Parameter Service: ADV setting (3042)
EnvsensorChars.prototype._parseParameterAdvSetting = function(buf) {
	if(buf.length !== 10) {
		return null;
	}
	return {
		indInterval        : Math.round(buf.readUInt16LE(0) * 0.625), // msec
		nonconIndInterval  : Math.round(buf.readUInt16LE(2) * 0.625), // msec
		transmissionPeriod : buf.readUInt16LE(4), // sec
		silentPeriod       : buf.readUInt16LE(6), // sec
		beaconMode         : buf.readUInt8(8), // 0 - 8,
		txPowerLevel       : buf.readInt8(9), // dBm (-20, -16, -12, -8, -4, 0, 4)
	};
};


// DFU Service: DFU Revision (3050)
EnvsensorChars.prototype._parseDfuRevision = function(buf) {
	if(buf.length !== 2) {
		return null;
	}
	return {
		dfuRevision : buf.readUInt16LE(0)
	};
};

// Generic Access Service: Device Name (2a00)
EnvsensorChars.prototype._parseGenericAccessDeviceName = function(buf) {
	if(buf.length === 14 || buf.length === 7) {
		return {
			deviceName: buf.toString('utf8')
		};
	} else {
		return null;
	}
};

// Generic Access Service: Appearance (2a01)
EnvsensorChars.prototype._parseGenericAccessAppearance = function(buf) {
	if(buf.length !== 2) {
		return null;
	}
	return {
		category: buf.readUInt16LE(0)
	};
};

// Generic Access Service: Peripheral Preferred Connection Parameters (2a04)
EnvsensorChars.prototype._parseGenericAccessConnectionParameters = function(buf) {
	if(buf.length !== 8) {
		return null;
	}
	return {
		minimumConnectionInterval: buf.readUInt16LE(0) * 1.25, // ms
		maximumConnectionInterval: buf.readUInt16LE(2) * 1.25, // ms
		slaveLatency: buf.readUInt16LE(4),
		connectionSupervisionTimeoutMultiplier: buf.readUInt16LE(6) * 10 // ms
	};
};

// Device Information Service: Model Number String (2a24)
EnvsensorChars.prototype._parseDeviceInformationModelNumber = function(buf) {
	if(buf.length !== 10) {
		return null;
	}
	return {
		modelNumber: buf.toString('utf8')
	};
};

// Device Information Service: Serial Number String (2a25)
EnvsensorChars.prototype._parseDeviceInformationSerialNumber = function(buf) {
	if(buf.length !== 10) {
		return null;
	}
	return {
		serialNumber: buf.toString('utf8')
	};
};

// Device Information Service: Firmware Revision String (2a26)
EnvsensorChars.prototype._parseDeviceInformationFirmwareRevision = function(buf) {
	if(buf.length !== 5) {
		return null;
	}
	return {
		firmwareRevision: buf.toString('utf8')
	};
};

// Device Information Service: Hardware Revision String (2a27)
EnvsensorChars.prototype._parseDeviceInformationHardwareRevision = function(buf) {
	if(buf.length !== 5) {
		return null;
	}
	return {
		hardwareRevision: buf.toString('utf8')
	};
};

// Device Information Service: Manufacturer Name String (2a29)
EnvsensorChars.prototype._parseDeviceInformationManufacturerName = function(buf) {
	if(buf.length !== 5) {
		return null;
	}
	return {
		manufacturerName: buf.toString('utf8')
	};
};

EnvsensorChars.prototype.createWriteBuffer = function(char_uuid, data) {
	/* ------------------------------------------------
	* Sensor Service
	* ---------------------------------------------- */
	if(char_uuid === '3003') {
		// Sensor Service: Request page
		return this._createSensorRequestPage(data);
	/* ------------------------------------------------
	* Setting Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3011') {
		// Setting Service: Measurement interval (3011)
		return this._createSettingMeasurementInterval(data);
	} else if(char_uuid.match(/^(3013|3014|3015|3016|3017|3018|3019|301a)$/)) {
		// Setting Service: Temperature (3013)
		// Setting Service: Relative humidity (3014)
		// Setting Service: Ambient light (3015)
		// Setting Service: UV index (3016)
		// Setting Service: Pressure (3017)
		// Setting Service: Sound noise (3018)
		// Setting Service: Discomfort index (3019)
		// Setting Service: Heat stroke
		return this._createEventSetting(char_uuid, data);
	/* ------------------------------------------------
	* Control Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3031') {
		// Control Service: Time information (3031)
		return this._createControlTimeInformation(data);
	} else if(char_uuid === '3032') {
		// Control Service: LED on duration (3032)
		return this._createControlLedOnDuration(data);
	} else if(char_uuid === '3033') {
		// Control Service: Error status (3033)
		return this._createControlErrorStatus(data);
	} else if(char_uuid === '3034') {
		// Control Service: Trigger (3034)
		return this._createControlTrigger(data);
	/* ------------------------------------------------
	* Parameter Service
	* ---------------------------------------------- */
	} else if(char_uuid === '3041') {
		// Parameter Service: UUIDs (3041)
		return this._createParameterUuids(data);
	} else if(char_uuid === '3042') {
		// Parameter Service: ADV setting (3042)
		return this._createParameterAdvSetting(data);
	} else {
		return null;
	}
};

/* -----------------------------------------------------------
* Sensor Service: Request page (3003)
*
* Method: _createSensorRequestPage(data)
* - data: {
*     page: 0,
*     row: 0
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createSensorRequestPage = function(data) {
	let err = null;

	if('page' in data) {
		let v = data['page'];
		if(typeof(v) !== 'number' || v % 1 > 0 || v < 0 || v > 2047) {
			return {error: new Error('The `page` must be an integer in the range of 0 to 2047.')};
		}
	} else {
		return {error: new Error('The `page` is required.')};
	}

	if('row' in data) {
		let v = data['row'];
		if(typeof(v) !== 'number' || v % 1 > 0 || v < 0 || v > 12) {
			return {error: new Error('The `row` must be an integer in the range of 0 to 12.')};
		}
	} else {
		return {error: new Error('The `row` is required.')};
	}

	let buf = Buffer.alloc(3);
	buf.writeUInt16LE(data['page'], 0);
	buf.writeUInt8(data['row'], 2);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Setting Service: Measurement interval (3011)
*
* Method: _createSettingMeasurementInterval(data)
* - data: {
*     measurementInterval: 300
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createSettingMeasurementInterval = function(data) {
	if('measurementInterval' in data) {
		let interval = data['measurementInterval'];
		if(typeof(interval) !== 'number' || interval % 1 > 0 || interval < 1 || interval > 3600) {
			return {error: new Error('The `measurementInterval` must be an integer in the range of 1 to 3600.')};
		}
	} else {
		return {error: new Error('The `measurementInterval` is required.')};
	}

	let buf = Buffer.alloc(2);
	buf.writeUInt16LE(data['measurementInterval'], 0);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Setting Service:
* - Temperature (3013)
* - Relative humidity (3014)
* - Ambient light (3015)
* - UV index (3016)
* - Pressure (3017)
* - Sound noise (3018)
* - Discomfort index (3019)
* - Heat stroke (301a)
*
* Method: _createEventSetting(char_uuid, data)
* - data: {
*     "lowerLimit": {
*       "enabled": false,
*       "threshold": 10
*     },
*     "upperLimit": {
*       "enabled": false,
*       "threshold": 35
*     },
*     "declineTerm": {
*       "enabled": false,
*       "threshold": 2
*     },
*     "riseTerm": {
*       "enabled": false,
*       "threshold": 2
*     },
*     "declinePrevious": {
*       "enabled": false,
*       "threshold": 2
*     },
*     "risePrevious": {
*       "enabled": false,
*       "threshold": 2
*     },
*     "measurements": 6,
*     "movingAverage": 1
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createEventSetting = function(char_uuid, data) {
	let mul = 1;
	if(char_uuid.match(/^(3013|3014|3016|3018|3019|301a)$/)) {
		mul = 100;
	} else if(char_uuid.match(/^(3017)$/)) {
		mul = 10;
	}

	let err = null;

	let klist = ['lowerLimit', 'upperLimit', 'declineTerm', 'riseTerm', 'declinePrevious', 'risePrevious'];
	for(let i=0; i<klist.length; i++) {
		let k = klist[i];
		if(!(k in data)) {
			err = 'The `' + k + '` is required.';
			break;
		}

		let o = data[k];
		if(typeof(o) !== 'object') {
			err = 'The `' + k + '` must be an object.';
			break;
		}

		if('enabled' in o) {
			let v = o['enabled'];
			if(typeof(v) !== 'boolean') {
				err = 'The `' + k + '.enabled` must be a boolean.';
				break;
			}
		} else {
			err = 'The `' + k + '.enabled` is required.';
			break;
		}

		if('threshold' in o) {
			let v = o['threshold'];
			if(typeof(v) !== 'number') {
				err = 'The `' + k + '.threshold` must be a number.';
				break;
			}
			if((v * mul) % 1 !== 0) {
				err = 'The `' + k + '` * ' + mul + ' must be an integer.';
				break;
			}
			let range = this._THRESHOLD_RANGES[char_uuid][k];
			if(v < range['min'] || v > range['max']) {
				err = 'The `' + k + '` * ' + mul + ' must be in the range of ' + range['min'] + ' to ' + range['max'] + '.';
				break;
			}
		} else {
			err = 'The `' + k + '.threshold` is required.';
			break;
		}
	}
	if(err) {
		return {error: new Error(err)};
	}

	['measurements', 'movingAverage'].forEach((k) => {
		if(k in data) {
			let v = data[k];
			if(typeof(v) !== 'number') {
				err = 'The `' + k + '` must be a number.';
			} else if(v % 1 > 0) {
				err = 'The `' + k + '` must be an integer.';
			} else if(v < 1 || v > 8) {
				err = 'The `' + k + '` must be in the range of 1 to 8.'
			}
		} else {
			err = 'The `' + k + '` is required.';
		}
	});
	if(err) {
		return {error: new Error(err)};
	}

	// Create a Buffer object
	let buf = Buffer.alloc(15);
	let n = 0;
	if(data['lowerLimit']['enabled']) {
		n = n | 0b00100000;
	}
	if(data['upperLimit']['enabled']) {
		n = n | 0b00010000;
	}
	if(data['declineTerm']['enabled']) {
		n = n | 0b00001000;
	}
	if(data['riseTerm']['enabled']) {
		n = n | 0b00000100;
	}
	if(data['declinePrevious']['enabled']) {
		n = n | 0b00000010;
	}
	if(data['risePrevious']['enabled']) {
		n = n | 0b00000001;
	}
	buf.writeUInt8(n, 0);
	buf.writeInt16LE(data['risePrevious']['threshold'] * mul, 1);
	buf.writeInt16LE(data['declinePrevious']['threshold'] * mul, 3);
	buf.writeInt16LE(data['riseTerm']['threshold'] * mul, 5);
	buf.writeInt16LE(data['declineTerm']['threshold'] * mul, 7);
	buf.writeInt16LE(data['upperLimit']['threshold'] * mul, 9);
	buf.writeInt16LE(data['lowerLimit']['threshold'] * mul, 11);
	buf.writeUInt8(data['measurements'], 13);
	buf.writeUInt8(data['movingAverage'], 14);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Control Service: Time information (3031)
*
* Method: _createControlTimeInformation(data)
* - data: {
*     unixTime: 1493692233
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createControlTimeInformation = function(data) {
	let err = null;

	if('unixTime' in data) {
		let v = data['unixTime'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 1 || v > 0xffffffff) {
			return {error: new Error('The `unixTime` must be an integer in the range of 1 to ' + 0xffffffff + '.')};
		}
	} else {
		return {error: new Error('The `unixTime` is required.')};
	}

	let buf = Buffer.alloc(4);
	buf.writeUInt32LE(data['unixTime'], 0);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Control Service: LED on duration (3032)
*
* Method: _createControlLedOnDuration(data)
* - data: {
*     duration: 3 // sec (1 - 10)
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createControlLedOnDuration = function(data) {
	if('duration' in data) {
		let v = data['duration'];
		if(typeof(v) !== 'number') {
			return {error: new Error('The `duration` must be `number`.')};
		} else if(v % 1 > 0 || v < 1 || v > 10) {
			return {error: new Error('The `duration` must be an integer in the range of 1 to 10.')};
		}
	} else {
		return {error: new Error('The `duration` is required.')};
	}

	let buf = Buffer.from([data['duration']]);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Control Service: Error status (3033)
*
* Method: _createControlErrorStatus(data)
* - data: {
*     sensor = {
*       accelerometer: false,
*       microphone   : false,
*       pressure     : false,
*       uv           : false,
*       light        : false,
*       humidity     : false,
*       temperature  : false
*     },
*     cpu = {
*       boot  : false,
*       flash : false
*     },
*     battery = {
*       read : false,
*       low  : false
*     }
*  }
*
* If you want to reset the error status, set the `data` to null
----------------------------------------------------------- */
EnvsensorChars.prototype._createControlErrorStatus = function(data) {
	let buf = Buffer.alloc(4);
	let sensor = 0;
	let cpu = 0;
	let battery = 0;
	if(data && typeof(data) === 'object') {
		if(data['sensor'] && typeof(data['sensor']) === 'object') {
			[
				'temperature',
				'humidity',
				'light',
				'uv',
				'pressure',
				'microphone',
				'accelerometer'
			].forEach((k, i) => {
				if(data['sensor'][k] === true) {
					sensor = sensor | (1 << i)
				}
			});
		}
		if(data['cpu'] && typeof(data['cpu']) === 'object') {
			[
				'flash',
				'boot'
			].forEach((k, i) => {
				if(data['cpu'][k] === true) {
					cpu = cpu | (1 << i)
				}
			});
		}
		if(data['battery'] && typeof(data['battery']) === 'object') {
			[
				'low',
				'read'
			].forEach((k, i) => {
				if(data['battery'][k] === true) {
					battery = battery | (1 << i)
				}
			});
		}
	}
	buf.writeUInt8(sensor, 0);
	buf.writeUInt8(cpu, 1);
	buf.writeUInt8(battery, 2);
	buf.writeUInt8(0x00, 3);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Control Service: Trigger (3034)
*
* Method: _createControlTrigger(data)
* - data: {
*     disconnect: false,
*     dfu: false
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createControlTrigger = function(data) {
	let err = null;

	if('disconnect' in data) {
		let v = data['disconnect'];
		if(typeof(v) !== 'boolean') {
			err = 'The `duration` must be Boolean.';
		}
	} else {
		err = 'The `disconnect` is required.';
	}

	if('dfu' in data) {
		let v = data['dfu'];
		if(typeof(v) !== 'boolean') {
			err = 'The `dfu` must be Boolean.';
		}
	} else {
		err = 'The `dfu` is required.';
	}

	if(err) {
		return {error: new Error(err)};
	} else {
		let buf = Buffer.alloc(2);
		buf.writeUInt8(data['disconnect'] ? 0x01 : 0x00, 0);
		buf.writeUInt8(data['dfu'] ? 0x01 : 0x00, 1);
		return {buffer: buf};
	}
};

/* -----------------------------------------------------------
* Parameter Service: UUIDs (3041)
*
* Method: _createParameterUuids(data)
* - data: {
*     uuid: '0C4C3000-7700-46F4-AA96D5E974E32A54',
*     major: 0,
*     minor: 0
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createParameterUuids = function(data) {
	let err = null;

	let uuid = '';
	if('uuid' in data) {
		let v = data['uuid'];
		if(typeof(v) !== 'string') {
			return {error: new Error('The `uuid` must be `String`.')};
		} else {
			v = v.replace(/\-/g, '').toLowerCase();
			if(v.match(/[^a-f0-9]/) || v.length !== 32) {
				return {error: new Error('The `uuid` is invalid.')};
			} else {
				uuid = v;
			}
		}
	} else {
		return {error: new Error('The `uuid` is required.')};
	}

	let major = 0;
	if('major' in data) {
		let v = data['major'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 0 || v > 0xffff) {
			return {error: new Error('The `major` must be an integer between 0x0000 and 0xFFFF.')};
		} else {
			major = v;
		}
	}

	let minor = 0;
	if('minor' in data) {
		let v = data['minor'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 0 || v > 0xffff) {
			return {error: new Error('The `minor` must be an integer between 0x0000 and 0xFFFF.')};
		} else {
			minor = v;
		}
	}

	let buf = Buffer.alloc(20);
	for(let i=0; i<16; i++) {
		let n = parseInt(uuid.substr(i*2, 2), 16);
		buf.writeUInt8(n, i);
	}
	buf.writeUInt16LE(major, 16);
	buf.writeUInt16LE(minor, 18);
	return {buffer: buf};
};

/* -----------------------------------------------------------
* Parameter Service: ADV setting (3042)
*
* Method: _createParameterAdvSetting(data)
* - data: {
*     indInterval: 1285,
*     nonconIndInterval: 100,
*     transmissionPeriod: 10,
*     silentPeriod: 50,
*     beaconMode: 8,
*     txPowerLevel: 0
*   }
----------------------------------------------------------- */
EnvsensorChars.prototype._createParameterAdvSetting = function(data) {
	let err = null;

	if('indInterval' in data) {
		let v = data['indInterval'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 500 || v > 10240) {
			return {error: new Error('The `indInterval` must be in the range of 500 to 10240.')};
		}
	} else {
		return {error: new Error('The `indInterval` is required.')};
	}

	if('nonconIndInterval' in data) {
		let v = data['nonconIndInterval'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 100 || v > 10240) {
			return {error: new Error('The `nonconIndInterval` must be an integer in the range of 100 to 10240.')};
		}
	} else {
		return {error: new Error('The `nonconIndInterval` is required.')};
	}

	if('transmissionPeriod' in data) {
		let v = data['transmissionPeriod'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 1 || v > 16383) {
			return {error: new Error('The `transmissionPeriod` must be an integer in the range of 1 to 16383.')};
		}
	} else {
		return {error: new Error('The `transmissionPeriod` is required.')};
	}

	if('silentPeriod' in data) {
		let v = data['silentPeriod'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || v < 1 || v > 16383) {
			return {error: new Error('The `silentPeriod` must be an integer in the range of 1 to 16383.')};
		}
	} else {
		return {error: new Error('The `silentPeriod` is required.')};
	}

	if('beaconMode' in data) {
		let v = data['beaconMode'];
		if(typeof(v) !== 'number' || !v.toString().match(/^(0|1|2|3|4|5|7|8)$/)) {
			err = 'The `beaconMode` must be 0, 1, 2, 3, 4, 5, 7, or 8.';
		}
	} else {
		err = 'The `beaconMode` is required.';
	}

	if('txPowerLevel' in data) {
		let v = data['txPowerLevel'];
		if(typeof(v) !== 'number' || v % 1 !== 0 || [-20, -16, -12, -8, -4, 0, 4].indexOf(v) === -1) {
			err = 'The `txPowerLevel` must be -20, -16, -12, -8, -4, 0, or 4.';
		}
	} else {
		err = 'The `txPowerLevel` is required.';
	}

	if(err) {
		return {error: new Error(err)};
	} else {
		let buf = Buffer.alloc(10);
		buf.writeUInt16LE(parseInt(data['indInterval'] / 0.625, 10), 0);
		buf.writeUInt16LE(parseInt(data['nonconIndInterval'] / 0.625, 10), 2);
		buf.writeUInt16LE(data['transmissionPeriod'], 4);
		buf.writeUInt16LE(data['silentPeriod'], 6);
		buf.writeUInt8(data['beaconMode'], 8);
		buf.writeInt8(data['txPowerLevel'], 9);
		return {buffer: buf};
	}
};

module.exports = new EnvsensorChars();
