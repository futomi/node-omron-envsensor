/* ------------------------------------------------------------------
* node-omron-envsensor - envsensor-advertising.js
* Date: 2018-05-31
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: EnvsensorAdvertising()
* ---------------------------------------------------------------- */
const EnvsensorAdvertising = function() {};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - buf: `Peripheral` object of the noble)
* ---------------------------------------------------------------- */
EnvsensorAdvertising.prototype.parse = function(peripheral) {
	if(!peripheral.id) {
		return null;
	}
	let ad = peripheral.advertisement;
	let manu = ad.manufacturerData;
	let local_name = ad.localName;
	if(!local_name || !/^(Env|IM|EP)$/.test(local_name)) {
		return null;
	}
	let company_id = manu ? manu.slice(1, 2).toString('hex') + manu.slice(0, 1).toString('hex') : '';
	if(!/^(02d5|004c)$/.test(company_id)) {
		return null;
	}
	let res = {
		id         : peripheral.id,
		uuid       : peripheral.uuid,
		address    : peripheral.address,
		localName  : ad.localName,
		rssi       : peripheral.rssi,
		companyId  : company_id,
		data       : {}
	};
	let manu_len = manu.length;
	let d = res['data'];
	if(local_name === 'Env') {
		if(manu_len === 25 && company_id === '004c') {
			// (A) Beacon
			d['type'] = manu.readUInt8(2); // 0x02 (2)
			d['length'] = manu.readUInt8(3); // 0x15 (21)
			d['uuid']  = [
				manu.slice( 4,  8).toString('hex'),
				manu.slice( 8, 10).toString('hex'),
				manu.slice(10, 12).toString('hex'),
				manu.slice(12, 14).toString('hex'),
				manu.slice(14, 20).toString('hex')
			].join('-').toUpperCase();
			d['major']   = manu.readUInt16LE(20);
			d['minor']   = manu.readUInt16LE(22);
			d['txPower'] = manu.readUInt8(24);
		} else if(manu_len === 29) {
			// (B) Connection Advertise 1 / Scan Response
			d['page']            = manu.readUInt16LE(2);
			d['row']             = manu.readUInt8(4);
			d['uniqueId']        = manu.slice(5, 9).toString('hex');
			d['eventFlag']       = this._parseEventFlag(manu.slice(9, 18));
			d['temperature']     = manu.readInt16LE(18) / 100; // °C
			d['humidity']        = manu.readInt16LE(20) / 100; // %
			d['ambientLight']    = manu.readInt16LE(22); // lx
			d['pressure']        = manu.readInt16LE(24) / 10; // hPa
			d['soundNoise']      = manu.readInt16LE(26) / 100; // dB
			d['discomfortIndex'] = this._calcDiscomfortIndex(d['temperature'], d['humidity']);
			d['heatStroke']      = this._calcHeatStroke(d['temperature'], d['humidity']);
			d['batteryVoltage']  = (manu.readUInt8(28) + 100) * 10; // mV
		} else if(manu_len === 17) {
			// (C) Connection Advertise 2
			let page_row = manu.readUInt16LE(2);
			d['page'] = (page_row >>> 4);
			d['row'] = (page_row & 0b0000000000001111);
			d['uniqueId'] = manu.slice(4, 8).toString('hex');
			d['eventFlag'] = this._parseEventFlag(manu.slice(8, 17));
		}
	} else if(local_name === 'IM') {
		if(manu_len === 22) {
			// (D) Sensor ADV 1 (ADV_IND)
			d['sequenceNumber']  = manu.readUInt8(2);
			d['temperature']     = manu.readInt16LE(3) / 100; // degC
			d['humidity']        = manu.readInt16LE(5) / 100; // %
			d['ambientLight']    = manu.readInt16LE(7); // lx
			d['uvIndex']         = manu.readInt16LE(9) / 100;
			d['pressure']        = manu.readInt16LE(11) / 10; // hPa
			d['soundNoise']      = manu.readInt16LE(13) / 100; // dB
			d['accelerationX']   = manu.readInt16LE(15) / 10; // mg
			d['accelerationY']   = manu.readInt16LE(17) / 10; // mg
			d['accelerationZ']   = manu.readInt16LE(19) / 10; // mg
			d['discomfortIndex'] = this._calcDiscomfortIndex(d['temperature'], d['humidity']);
			d['heatStroke']      = this._calcHeatStroke(d['temperature'], d['humidity']);
			d['batteryVoltage']  = (manu.readUInt8(21) + 100) * 10; // mV
		}
	} else if(local_name === 'EP') {
		if(manu_len === 22) {
			// (E) Sensor ADV 2 (ADV_IND)
			d['sequenceNumber']  = manu.readUInt8(2);
			d['temperature']     = manu.readInt16LE(3) / 100; // degC
			d['humidity']        = manu.readInt16LE(5) / 100; // %
			d['ambientLight']    = manu.readInt16LE(7); // lx
			d['uvIndex']         = manu.readInt16LE(9) / 100;
			d['pressure']        = manu.readInt16LE(11) / 10; // hPa
			d['soundNoise']      = manu.readInt16LE(13) / 100; // dB
			d['discomfortIndex'] = manu.readInt16LE(15) / 100;
			d['heatStroke']      = manu.readInt16LE(17) / 100; // degC
			d['batteryVoltage']  = (manu.readUInt8(21) + 100) * 10; // mV
		}
	}
	return res;
};

EnvsensorAdvertising.prototype._parseEventFlag = function(buf) {
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

EnvsensorAdvertising.prototype._calcDiscomfortIndex = function(temp, humi) {
	let idx = (0.81 * temp) + 0.01 * humi * ((0.99 * temp) - 14.3) + 46.3;
	idx = Math.round(idx * 100) / 100;
	return idx;
};

EnvsensorAdvertising.prototype._calcHeatStroke = function(temp, humi) {
	if(temp < 0) {
		temp = 0;
	}
	if(humi < 0) {
		humi = 0;
	}
	if(humi > 100) {
		humi = 100;
	}
	let wbgt = (0.567 * temp) + 0.393 * (humi / 100 * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) + 3.94;
	wbgt = (wbgt + (1.1 * (1 - (humi / 62) * 1.6)) * (temp - 30) * 0.17 - Math.abs(temp - 30) * 0.09) / 1.135;

	wbgt = Math.round(wbgt * 100) / 100;
	return wbgt
};

module.exports = new EnvsensorAdvertising();
