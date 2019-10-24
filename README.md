node-omron-envsensor
===============

The node-omron-envsensor is a Node.js module which allows you to communicate with the [OMRON Environment Sensor (2JCIE-BL01)](https://www.components.omron.com/web/en/solutions/mems-sensors/environment-sensor).

![OMRON Environment Sensor (2JCIE-BL01)](imgs/2JCIE-BL01.jpg)

## Supported OS

The node-omron-envsensor supports only Linux-based OSes, such as Raspbian, Ubuntu, and so on. This module does not support Windows and Mac OS for now. (If noble is installed properly, this module might work well on such OSes.)

## Dependencies

* [Node.js](https://nodejs.org/en/) 6 +
* [@abandonware/noble](https://github.com/abandonware/noble)


See the document of the [@abandonware/noble](https://github.com/abandonware/noble) for details on installing the [@abandonware/noble](https://github.com/abandonware/noble).

Note that the noble has to be run as root on most of Linux environments. See the the document of the [@abandonware/noble](https://github.com/abandonware/noble) for details.

The early versions of this module depended on [noble](https://github.com/sandeepmistry/noble) for BLE handling. But the [noble](https://github.com/sandeepmistry/noble) seems not to support Node v10 or later versions. Now, this module is employing [@abandonware/noble](https://github.com/abandonware/noble), which was forked from [noble](https://github.com/sandeepmistry/noble). For the purouse of the backward compatibility, this module works with [noble](https://github.com/sandeepmistry/noble) on Node v8 or earlier versions.

## Installation

```
$ cd ~
$ npm install @abandonware/noble
$ npm install node-omron-envsensor
```

---------------------------------------
## Table of Contents

* [Quick Start](#Quick-Start)
  * [Discovering and connecting to a device](#Quick-Start-1)
  * [Getting the latest sensor data](#Quick-Start-2)
  * [Receiving sensor data notifications](#Quick-Start-3)
* [`Envsensor` object](#Envsensor-object)
  * [`init()` method](#Envsensor-init-method)
  * [`discover()` method](#Envsensor-discover-method)
  * [`ondiscover` event handler](#Envsensor-ondiscover-event-handler)
  * [`scartScan()` method](#Envsensor-startScan-method)
  * [`stopScan()` method](#Envsensor-stopScan-method)
  * [`onadvertisement` event handler](#Envsensor-onadvertisement-event-handler)
* [`EnvsensorDevice` object](#EnvsensorDevice-object)
  * [Properties](#EnvsensorDevice-properties)
  * [`isConnected()` method](#EnvsensorDevice-isConnected-method)
  * [`connect()` method](#EnvsensorDevice-connect-method)
  * [`disconnect()` method](#EnvsensorDevice-disconnect-method)
  * [`ondisconnected` event handler](#EnvsensorDevice-ondisconnected-event-handler)
  * [`getDeviceInfo()` method](#EnvsensorDevice-getDeviceInfo-method)
  * [`getBasicConfigurations()` method](#EnvsensorDevice-getBasicConfigurations-method)
  * [`setBasicConfigurations()` method](#EnvsensorDevice-setBasicConfigurations-method)
  * [`getRecordingStatus()` method](#EnvsensorDevice-getRecordingStatus-method)
  * [`startRecording()` method](#EnvsensorDevice-startRecording-method)
  * [`stopRecording()` method](#EnvsensorDevice-stopRecording-method)
  * [`getRecordedDataList()` method](#EnvsensorDevice-getRecordedDataList-method)
  * [`getLatestData()` method](#EnvsensorDevice-getLatestData-method)
  * [`startMonitoringData()` method](#EnvsensorDevice-startMonitoringData-method)
  * [`stopMonitoringData()` method](#EnvsensorDevice-stopMonitoringData-method)
  * [`onsensordata` event handler](#EnvsensorDevice-onsensordata-event-handler)
* [Advertisement data](#Advertisement-data)
  * [(A) Beacon](#Advertisement-data-A)
  * [(B) Connection Advertise 1](#Advertisement-data-B)
  * [(C) Connection Advertise 2 (ADV_IND)](#Advertisement-data-C)
  * [(D) Sensor ADV 1 (ADV_IND)](#Advertisement-data-D)
  * [(E) Sensor ADV 2 (ADV_IND)](#Advertisement-data-E)
* [Low level APIs of `EnvsensorDevice` object](#Low-Level-APIs)
* [Release Note](#Release-Note)
* [References](#References)
* [License](#License)

---------------------------------------
## <a id="Quick-Start">Quick Start</a>

### <a id="Quick-Start-1">Discovering and connecting to a device</a>

The code below discovers a device, establishes a connection with the device, then gets the device information.

```JavaScript
// Load the node-omron-envsensor and get a `Envsensor` constructor object
const Envsensor = require('node-omron-envsensor');
// Create an `Envsensor` object
const envsensor = new Envsensor();
// `EnvsensorDevice` object
let device = null;

// Initialize the `Envsensor` object
envsensor.init().then(() => {
  // Discover a device
  return envsensor.discover({quick:true});
}).then((device_list) => {
  if(device_list.length === 0) {
    throw new Error('No device was found.');
  }
  // `EnvsensorDevice` object representing the found device
  device = device_list[0];
  // Connect to the device
  return device.connect();
}).then(() => {
  // Get the device information
  return device.getDeviceInfo();
}).then((data) => {
  // Show the device information
  console.log(JSON.stringify(data, null, '  '));
  // Disconnect the device
  return device.disconnect();
}).then(() => {
  process.exit();
}).catch((error) => {
  console.error(error);
});
```

First of all, you have to create an [`Envsensor`](#Envsensor-object) object from the `Envsensor` constructor object. In the code above, the variable `envsensor` is the [`Envsensor`](#Envsensor-object) object.

Calling the [`init()`](#Envsensor-init-method) method, the [`Envsensor`](#Envsensor-object) object becomes ready for use. Never forget to call the method. Note that the all asynchronous methods implemented in the [`Envsensor`](#Envsensor-object) object return a `Promise` object.

The [`discover()`](#Envsensor-discover-method) method of the [`Envsensor`](#Envsensor-object) object discovers OMRON Environment Sensor 2JCIE-BL01 devices. By default, the discovery process takes 5 seconds. In the code above, the `quick` parameter is set to `true`. This means that the method returns immediately after a device is found.

In the code above, the variable `device` is a [`EnvsensorDevice`](#EnvsensorDevice-object) object representing the found device. This object provides a lot of methods to interact with the device.

At this moment, you are not able to interact with the device yet. You have to call the [`connect()`](#EnvsensorDevice-connect-method) method in order to interact with it. Once the device is connected, you can call the all methods provided by the [`EnvsensorDevice`](#EnvsensorDevice-object) object.

The sample code above will output the result as follows:

```javascript
{
  "deviceName": "EnvSensor-BL01",
  "modelNumber": "2JCIE-BL01",
  "serialNumber": "0586MY0005",
  "firmwareRevision": "01.09",
  "hardwareRevision": "01.01",
  "manufacturerName": "OMRON"
}
```

See the section "[`getDeviceInfo()` method](#EnvsensorDevice-getDeviceInfo-method)" for the details of the meanings of the values.

### <a id="Quick-Start-2">Getting the latest sensor data</a>

The OMRON Environment Sensor 2JCIE-BL01 stores the latest sensor data in the flash memory. You can obtain the latest sensor data using the [`getLatestData()`](#EnvsensorDevice-getLatestData-method) method of the [`EnvsensorDevice`](#EnvsensorDevice-object) object anytime.

```JavaScript
// Load the node-omron-envsensor and get a `Envsensor` constructor object
const Envsensor = require('node-omron-envsensor');
// Create an `Envsensor` object
const envsensor = new Envsensor();
// `EnvsensorDevice` object
let device = null;

// Initialize the `Envsensor` object
envsensor.init().then(() => {
  // Discover a device
  return envsensor.discover({quick:true});
}).then((device_list) => {
  if(device_list.length === 0) {
    throw new Error('No device was found.');
  }
  // `EnvsensorDevice` object representing the found device
  device = device_list[0];
  // Connect to the device
  return device.connect();
}).then(() => {
  // Get the latest sensor data
  return device.getLatestData();
}).then((data) => {
  // Show the result
  console.log(JSON.stringify(data, null, '  '));
  // Disconnect the device
  return device.disconnect();
}).then(() => {
  process.exit();
}).catch((error) => {
  console.error(error);
});
```

The sample code above will output the result as follows:

```javascript
{
  "row": 0,
  "temperature": 31.41,
  "humidity": 40.67,
  "ambientLight": 140,
  "uvIndex": 0.02,
  "pressure": 996.8,
  "soundNoise": 46.01,
  "discomfortIndex": 78.57,
  "heatStroke": 25.38,
  "batteryVoltage": 2854
}
```

See the section "[`getLatestData()` method](#EnvsensorDevice-getLatestData-method)" for the details of the meanings of the values.

### <a id="Quick-Start-3">Receiving sensor data notifications</a>

The OMRON Environment Sensor 2JCIE-BL01 supports a notification mechanism to notify sensor data in real time.

You have to set the measurement interval using the [`setBasicConfigurations()`](#EnvsensorDevice-setBasicConfigurations-method) method. The code blow sets the interval to 3 seconds. This means that the device notifies the sensor data every 3 seconds.

Then you have to set the [`onsensordata`](#EnvsensorDevice-onsensordata-event-handler) event handler to receive notifications coming from the device.

Calling the [`startMonitoringData()`](#EnvsensorDevice-startMonitoringData-method) method, the device starts to notify sensor data and the [`onsensordata`](#EnvsensorDevice-onsensordata-event-handler) event handler is called whenever a notification is received.

Calling the [`stopMonitoringData()`](#EnvsensorDevice-stopMonitoringData-method) method, the device stops to notify sensor data.

```JavaScript
// Load the node-omron-envsensor and get a `Envsensor` constructor object
const Envsensor = require('node-omron-envsensor');
// Create an `Envsensor` object
const envsensor = new Envsensor();
// `EnvsensorDevice` object
let device = null;

// Initialize the `Envsensor` object
envsensor.init().then(() => {
  // Discover a device
  return envsensor.discover({quick:true});
}).then((device_list) => {
  if(device_list.length === 0) {
    throw new Error('No device was found.');
  }
  // `EnvsensorDevice` object representing the found device
  device = device_list[0];
  // Connect to the device
  return device.connect();
}).then(() => {
  // Set the measurement interval to 3 seconds
  return device.setBasicConfigurations({
    measurementInterval: 3
  });
}).then(() => {
  // Set a callback function to receive notifications
  device.onsensordata = (data) => {
    console.log(JSON.stringify(data, null, '  '));
  };
  // Start monitoring data
  return device.startMonitoringData();
}).then(() => {
  // Stop monitoring data and disconnect the device in 10 seconds
  setTimeout(() => {
    // Stop monitoring data
    device.stopMonitoringData().then(() => {
      // Disconnect the device
      return device.disconnect();
    }).then(() => {
      process.exit();
    });
  }, 10000);
}).catch((error) => {
  console.error(error);
});
```

The sample code above will output the result as follows:

```javascript
{
  "rowSeq": 0,
  "temperature": 31.51,
  "humidity": 40.46,
  "ambientLight": 135,
  "uvIndex": 0.02,
  "pressure": 996.8,
  "soundNoise": 33.18,
  "discomfortIndex": 78.65,
  "heatStroke": 25.46,
  "batteryVoltage": 2858
}
...
```

See the section "[`getLatestData()` method](#EnvsensorDevice-getLatestData-method)" for the details of the meanings of the values.

---------------------------------------
## <a id="Envsensor-object">`Envsensor` object</a>

In order to use the node-omron-envsensor, you have to load the node-omron-envsensor module as follows:

```JavaScript
const Envsensor  = require('node-omron-envsensor');
```

You can get an `Envsensor` constructor from the code above. Then you have to create an `Envsensor` object from the `Envsensor` constructor as follows:

```javascript
const envsensor = new Envsensor();
```

The `Envsensor` constructor takes an argument optionally. It must be a hash object containing the properties as follows:

Property | Type   | Required | Description
:--------|:-------|:---------|:-----------
`noble`  | Noble  | option   | a Noble object of the [`noble`](https://www.npmjs.com/package/noble) module

The node-omron-envsensor module uses the [`noble`](https://www.npmjs.com/package/noble) module in order to interact with the device(s) on BLE. If you want to interact other BLE devices using the noble module, you can create an `Noble` object by yourself, then pass it to this module. If you don't specify a `Noble` object to the `noble` property, this module automatically create a `Noble` object internally.

The sample code below shows how to pass a `Nobel` object to the `Envsensor` constructor.

```JavaScript
// Create a Noble object
const noble = require('noble');

// Create a Envsensor object
const Envsensor = require('node-omron-envsensor');
const envsensor = new Envsensor({'noble': noble});
```

In the code snippet above, the variable `envsensor` is an `Envsensor` object. The `Envsensor` object has a lot of methods as described in sections below.

### <a id="Envsensor-init-method">`init()` method</a>

A `Envsensor` object is not ready to use initially. It has to be initialized using the `init()` method as below:

```JavaScript
envsensor.init().then(() => {
  // You can call methods implemented in the `Envsensor` object
}).catch((error) => {
  console.error(error);
});
```

The `init()` method returns a `Promise` object. Once the `Envsensor` object is initialized successfully, you can call methods as described in the sections below.

### <a id="Envsensor-discover-method">`discover([params])` method</a>

The `discover` method finds devices. This method returns a `Promise` object. This method takes an argument which is a hash object containing parameters as follows:

Property     | Type    | Required | Description
:------------|:--------|:---------|:------------
`duration`   | Integer | Optional | Duration for discovery process (msec). The default value is 5000 (msec).
`idFilter`   | String  | Optional | If this value is set, the device whose ID (`id`) does not start with the specified keyword will be ignored.
`quick`      | Boolean | Optional | If this value is `true`, this method finishes the discovery process when the first device is found, then calls the `resolve()` function without waiting the specified `duration`. The default value is `false`.

In the code snippet below, no parameter is passed to the method:

```JavaScript
envsensor.init().then(() => {
  return envsensor.discover();
}).then((device_list) => {
  // Do something...
}).catch((error) => {
  console.error(error);
});
```

If no parameter is passed to the method as code above,  an `Array` object will be passed to the `resolve()` function in 5 seconds. The `Array` object contains [`EnvsensorDevice`](#EnvsensorDevice-object) objects representing the found devices. See the section "[`EnvsensorDevice`](#EnvsensorDevice-object) objects" for more details.

If you want a quick response, you can set the `quick` property to `true`.

```JavaScript
envsensor.init().then(() => {
  return envsensor.discover({
    duration: 5000,
    quick: true
  });
}).then((device_list) => {
  // Do something...
}).catch((error) => {
  console.error(error);
});
```

As the `quick` property is set to `true`, the `resolve()` function will be called immediately after a device is found regardless the value of the `duration` property.

### <a id="Envsensor-ondiscover-event-handler">`ondiscover` event hander</a>

The `ondiscover` property on the [`Envsensor`](#Envsensor-object) object is an event handler whenever a device is newly found in the discovery process. A [`EnvsensorDevice`](#EnvsensorDevice-object) object is passed to the callback function set to the `ondiscover` property.

```JavaScript
envsensor.init().then(() => {
  envsensor.ondiscover = (device) => {
    console.log('- ' + device.id);
  };
  console.log('Starting the discovery process...');
  return envsensor.discover({
    duration: 10000
  });
}).then((device_list) => {
  console.log('The discovery process was finished.');
  console.log(device_list.length + ' devices were found.');
  process.exit();
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```JavaScript
Starting the discovery process...
- c4f4393b5905
- ded7723b7199
The discovery process was finished.
2 devices were found.
```


### <a id="Envsensor-startScan-method">scartScan(*[params]*) method</a>

The `startScan()` method starts to scan advertising packets from devices. This method takes an argument which is a hash object containing the parameters as follows:

Property     | Type   | Required | Description
:------------|:-------|:---------|:------------
`idFilter`   | String | Optional | If this value is set, advertising packets from the devices whose ID (`id`) does not start with the specified keyword will be ignored.

Whenever a packet is received, the callback function set to the [`onadvertisement`](#Envsensor-onadvertisement-event-handler) property of the `Envsensor` object will be called. When a packet is received, a hash object representing the packet will be passed to the callback function.

```JavaScript
// Set a callback function called when a packet is received
envsensor.onadvertisement = (ad) => {
  console.log(JSON.stringify(ad, null, '  '));
};

// Start to scan advertising packets from BL01
envsensor.startScan({
  idFilter: 'ded7723b7199'
});

// Stop to scan in 30 seconds
setTimeout(() => {
  envsensor.stopScan();
  process.exit();
}, 30000);
```

The code snippet above will output the result as follows:

```
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "Env",
  "rssi": -29,
  "companyId": "02d5",
  "data": { ... }
}
...
```

The `data` property depends on the beacon mode. See the section "[Advertisement data](#Advertisement-data)" for the details of the data format.

### <a id="Envsensor-stopScan-method">stopScan() method</a>

The `stopScan()` method stops to scan advertising packets from devices. See the section "[`startScan()` method](#Envsensor-startScan-method)" for details.

### <a id="Envsensor-onadvertisement-event-handler">`onadvertisement` event handler</a>

If a callback function is set to the `onadvertisement` property, the callback function will be called whenever an advertising packet is received from a device during the scan is active (from the moment when the `startScan()` method is called, to the moment when the `stopScan()` method is called).

See the section "[`startScan()` method](#Envsensor-startScan-method)" for details.

---------------------------------------
## <a id="EnvsensorDevice-object">`EnvsensorDevice` object</a>

The `EnvsensorDevice` object represents an OMRON Environment Sensor (2JCIE-BL01), which is created through the discovery process triggered by the [`Envsensor.discover()`](#Envsensor-discover-method) method. This section describes the properties and methods implemented in this object.

### <a id="EnvsensorDevice-properties">Properties</a>

The `EnvsensorDevice` object supports the properties as follows:

Property         | Type     | Description
:----------------|:---------|:-----------
`id`             | String   | ID of the device. (e.g., `"192.168.10.4"`)
`ondisconnected` | Function | See the section "[`ondisconnected` event handler](#EnvsensorDevice-ondisconnected-event-handler)" for details.
`onsensordata`   | Function | See the section "[`onsensordata` event handler](#EnvsensorDevice-onsensordata-event-handler)" for details.
`oneventflag`    | Function | See the section "[`oneventflag` event handler](README_LOW_LEVEL_API.md#EnvsensorDevice-oneventflag-event-handler)" for details.

### <a id="EnvsensorDevice-isConnected-method">isConnected() method</a>

The `isConnected()` method returns whether the device is connected or not. If the device is connected, this method returns `true`. Otherwise, it returns `false`.

```javascript
if(device.isConnected()) {
  console.log('Connected.');
} else {
  console.log('Not connected.');
}
```

### <a id="EnvsensorDevice-connect-method">connect() method</a>

The `connect()` method establishes a connection with the device (i.e., pairing). This method returns a `Promise` object. If the device has already been connected, this method does nothing and calls the `resolve()` function immediately.

The code snippet below establishes a connection with a device, then it shows the ID of the device. Finally, it disconnects the device:

```javascript
device.connect().then(() => {
  console.log('Connected.');
  console.log('- ' + device.id);
  return device.disconnect();
}).then(() => {
  console.log('Disconnected.');
}).catch((error) => {
  console.error(error);
});
```

The result will be as follows:

```
Connected.
- ded7723b7199
Disconnected.
```

### <a id="EnvsensorDevice-disconnect-method">disconnect() method</a>

The `disconnect()` method disconnects the device. This method returns a `Promise` object. If the device has already been disconnected, this method does nothing and calls the `resolve()` function immediately.

See the [previous section](#EnvsensorDevice-connect-method) for details.

### <a id="EnvsensorDevice-ondisconnected-event-handler">ondisconnected event handler</a>

The `ondisconnected` event handler will be called when the connection with the device is disconnected. When this event handler is called, a hash object which contains the properties as follows is passed to this event handler:

Property   | Type    | Description
:----------|:--------|:-----------
`wasClean` | Boolean | If the connection was closed intentionally, that is, if the connection was closed because the [`disconnect()`](#EnvsensorDevice-disconnect-method) method was called, this value is `true`. Otherwise, this value is `false`.

```javascript
device.ondisconnected = (reason) => {
  if(reason.wasClean === true) {
    console.log('The connection was closed intentionally.');
  } else {
    console.log('The connection was closed unexpectedly.')
  }
};
```

### <a id="EnvsensorDevice-getDeviceInfo-method">getDeviceInfo() method</a>

The `getDeviceInfo()` method fetches the device information from the device. This method returns a `Promise` object.

If the information is fetched successfully, a hash object containing the information will be passed to the `resolve()` function. The hash object has the properties as follows:

Property           | Type    | Description
:------------------|:--------|:-----------
`deviceName`       | String  | Device Name (e.g., `"EnvSensor-BL01"`)
`modelNumber`      | String  | Model Number	(e.g., `"2JCIE-BL01"`)
`serialNumber`     | String  | Serial Number (e.g., `"0586MY0005"`)
`firmwareRevision` | String  | Firmware Revision (e.g., `"01.09"`)
`hardwareRevision` | String  | Hardware Revision (e.g., `"01.01"`)
`manufacturerName` | String  | Manufacturer Name (e.g., `"OMRON"`)

```javascript
device.getDeviceInfo().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "deviceName": "EnvSensor-BL01",
  "modelNumber": "2JCIE-BL01",
  "serialNumber": "0586MY0005",
  "firmwareRevision": "01.09",
  "hardwareRevision": "01.01",
  "manufacturerName": "OMRON"
}
```

Though most of values are fixed values, only the value of the `deviceName` could be changed depending on the beacon mode.

Beacon Mode | Beacon Mode Name        | Device Name
:-----------|:------------------------|:-----------------
`0x00`      | Event Beacon (SCAN RSP) | `"EnvSensor-BL01"`
`0x01`      | Standard Beacon         | `"EnvSensor-BL01"`
`0x02`      | General Broadcaster 1   | `"IM-BL01"`
`0x03`      | Limited Broadcaster 1   | `"IM-BL01"`
`0x04`      | General Broadcaster 2   | `"EP-BL01"`
`0x05`      | Limited Broadcaster 2   | `"EP-BL01"`
`0x07`      | Alternate Beacon        | `"EnvSensor-BL01"`
`0x08`      | Event Beacon (ADV)      | `"EnvSensor-BL01"`

### <a id="EnvsensorDevice-getBasicConfigurations-method">getBasicConfigurations() method</a>

The `getBasicConfigurations()` method fetches the basic configurations from the device. This method returns a `Promise` object.

If the basic configurations are fetched successfully, a hash object containing the configurations will be passed to the `resolve()` function. The hash object has the properties as follows:

Property              | Type    | Description
:---------------------|:--------|:-----------
`measurementInterval` | Integer | Measurement interval. The unit is second. The value is in the range of `1` to `3600`.
`beaconMode`          | Integer | Beacon Mode. The value is `0`, `1`, `2`, `3`, `4`, `5`, `7`, or `8`. See the section "[Advertisement data](#Advertisement-data)" for details.
`txPowerLevel`        | Integer | Tx Power. The unit is dBm. The value is `-20`, `-16`, `-12`, `-8`, `-4`, `0`, or `4`.
`uuid`                | String  | UUID. This value is used when the beacon mode is `0x07` (Alternate Beacon). When the device is in the beacon mode, it sends iBeacon compatible packets as advertising packets.

```javascript
device.getBasicConfigurations().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "measurementInterval": 3,
  "beaconMode": 8,
  "txPowerLevel": 0,
  "uuid": "0C4C3000-7700-46F4-AA96D5E974E32A54"
}
```

### <a id="EnvsensorDevice-setBasicConfigurations-method">setBasicConfigurations(*params*) method</a>

The `setBasicConfigurations()` method sets the basic configurations to the device. This method returns a `Promise` object.

This method takes a hash object as an argument containing the properties as follows:

Property              | Type    | Required | Description
:---------------------|:--------|:---------|:-----------
`measurementInterval` | Integer | Optional | Measurement interval. The value must be in the range of 1 to 3600 (sec).
`beaconMode`          | Integer | Optional | Beacon Mode. The value must be `0`, `1`, `2`, `3`, `4`, `5`, `7`, or `8`. See the section "[Advertisement data](#Advertisement-data)" for details.
`txPowerLevel`        | Integer | Optional | Tx Power. The value must be `-20`, `-16`, `-12`, `-8`, `-4`, `0`, or `4` (dBm).
`uuid`                | String  | Optional | UUID. This value is used when the beacon mode is `0x07` (Alternate Beacon). When the device is in the beacon mode, it sends iBeacon compatible packets as advertising packets. The format must be `"0C4C3000-7700-46F4-AA96D5E974E32A54"`.

Note that at least one property must be specified though all properties are optional.

Though the device supports the iBeacon compatible advertising packet, it does not allow you to set the values of the major and the minor and apply them to iBeacon compatible packets. In an iBeacon compatible packet, the major and the minor are used for other purposes. See the section "[Advertisement data](#Advertisement-data)" for details.

```javascript
device.setBasicConfigurations({
  measurementInterval: 3,
  beaconMode: 0
}).then(() => {
  console.log('Done.');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getRecordingStatus-method">getRecordingStatus() method</a>

The OMRON Environment Sensor (2JCIE-BL01) supports storing measurement records in its flash memory. The flash memory is divided to 2048 blocks which are called "pages". 13 records can be stored in a page. That is, at most 26,624 (13 * 2048) records can be stored in the flash memory. The page number is in the range of 0 to 2047. The row number is in the range of 0 to 12. In this document, the storing position in the flash memory is represented in the form of (*page*, *row*). (0, 0) means that the page number is 0 and the row number is 0. (0, 1) means that the page number is 0 and the row number is 1.

By default, the recording mode is disabled. You can enable the recording mode using the [`startRecording()`](#EnvsensorDevice-startRecording-method) method, disable using the [`stopRecording()`](#EnvsensorDevice-stopRecording-method) method.

After the recording mode is started, the first record is saved in the position (0, 0). The next record is saved in the position (0, 1). If the position reaches the last row, which means that the position is (0, 12), the next record is saved in the position (1, 0).

If the position reaches the position (2047, 12), the next record is saved in the position (0, 0). That means the new record replaces the old record.

The `getRecordingStatus()` method reads the status of the recording mode from the device. This method returns a `Promise` object.

If the status of the recording mode is fetched successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property              | Type    | Description
:---------------------|:--------|:-----------
`beaconMode`          | Integer | Beacon Mode. The value is `0`, `1`, `2`, `3`, `4`, `5`, `7`, or `8`.
`isRecording`         | Boolean | If the device is in the recording mode, the value is `true`. Otherwise, it is `false`.
`page`                | Integer | Latest page number. The value is in the range of 0 to 2047.
`row`                 | Integer | Latest row number. The value is in the range of 0 to 12.
`measurementInterval` | Integer | Measurement interval. The unit is second. The value is in the range of `1` to `3600`.
`unixTime`            | Integer | Created time of the latest page. The value is a UNIX time. The unit is second. If The recording mode is disabled, this value is set to `0`.

As you can see the table above, you can know all information related to the recording mode using this method.

```javascript
device.getRecordingStatus().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "beaconMode": 0,
  "isRecording": false,
  "page": 0,
  "row": 0,
  "measurementInterval": 3,
  "unixTime": 0
}
```

### <a id="EnvsensorDevice-startRecording-method">startRecording() method</a>

The `startRecording()` method starts the recording mode. This method returns a `Promise` object.

If the recording mode has already been started, this method does nothing and calls the `resolve()` function.

The OMRON Environment Sensor (2JCIE-BL01) allows us to enable the recording mode only if the beacon mode is `0`, `1`, `7`, or `8`. If the beacon mode is `2`, `3`, `4`, `5`, this method changes the beacon mode to `8` automatically.

```javascript
device.startRecording().then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-stopRecording-method">stopRecording() method</a>

The `stopRecording()` method stops the recording mode. This method returns a `Promise` object.

If the recording mode has already been stopped, this method does nothing and calls the `resolve()` function.

```javascript
device.stopRecording().then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getRecordedDataList-method">getRecordedDataList() method</a>

The `getRecordedDataList()` method fetches the records saved in the specified page in the flash memory. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property  | Type    | Required | Description
:---------|:--------|:---------|:-----------
`page`    | Integer | Optional | Page number that you want to read. The value must be in the range of 0 to 2047.

If the `page` is not specified, the latest page is applied. Note that this method rejects if the recording mode has not been started.

If the records are fetched successfully, a hash object will be passed to the `resolve()` function. The hash object has the properties as follows:

Property              | Type    | Description
:---------------------|:--------|:-----------
`page`                | Integer | Page number in which this method read the records.
`measurementInterval` | Integer | Measurement interval. The unit is second. The value is in the range of `1` to `3600`.
`dataList`            | Array   | List of the records saved in the page. At most 13 records are contained in the list.

```javascript
device.getRecordedDataList({ page: 2 }).then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "page": 2,
  "measurementInterval": 3,
  "dataList": [
    {
      "row": 0,
      "temperature": 29.7,
      "humidity": 47.33,
      "ambientLight": 166,
      "uvIndex": 0.02,
      "pressure": 993.3,
      "soundNoise": 34.3,
      "discomfortIndex": 77.5,
      "heatStroke": 25.05,
      "batteryVoltage": 2851,
      "unixTime": 1527746251,
      "timeStamp": "2018-05-31T14:57:31+09:00"
    },
    ...
  ]
}
```

The structure of each data in the `dataList` is as same as the data obtained from the [`getLatestData()`](#EnvsensorDevice-getLatestData-method) method. See the section "[`getLatestData()` method](#EnvsensorDevice-getLatestData-method)" for details.

### <a id="EnvsensorDevice-getLatestData-method">getLatestData() method</a>

The `getLatestData()` method fetches the latest measured data from the device. This method returns a `Promise` object.

If the the record is fetched successfully, a hash object will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`row`             | Integer | The recording mode has been started, this value means the latest row number in the range of 0 to 12. Otherwise, if the recording mode has not been started and the beacon mode is `0`, `1`, `7`, or `8`, this value always 0. Otherwise, this value means the sequence number in the range of 0 to 255.
`temperature`     | Float   | Temperature (degC)
`humidity`        | Float   | Relative Humidity (%RH)
`ambientLight`    | Float   | Ambient Light (lux)
`uvIndex`         | Float   | UV Index
`pressure`        | Float   | Barometric Pressure (hPa)
`soundNoise`      | Float   | Sound noise (dB)
`discomfortIndex` | Float   | Discomfort Index
`heatStroke`      | Float   | Heatstroke risk factor (degC)
`batteryVoltage`  | Integer | Battery voltage (mV)

```javascript
device.getLatestData().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "row": 12,
  "temperature": 29.55,
  "humidity": 50.98,
  "ambientLight": 169,
  "uvIndex": 0.02,
  "pressure": 993.4,
  "soundNoise": 40.68,
  "discomfortIndex": 77.85,
  "heatStroke": 25.35,
  "batteryVoltage": 2844
}
```

### <a id="EnvsensorDevice-startMonitoringData-method">startMonitoringData() method</a>

The `startMonitoringData()` method starts monitoring measured data notifications in real time. This method returns a `Promise` object.

If it starts monitoring measured data notifications successfully, the [`onsensordata`](#EnvsensorDevice-onsensordata-event-handler) event handler will be called whenever a notification is received.

```javascript
device.onsensordata = (data) => {
  console.log(JSON.stringify(data, null, '  '));
};
device.startMonitoringData().then(() => {
  console.log('Started.');
}).catch((error) => {
  console.error(error);
});
```

The code above will output the result as follows:

```javascript
{
  "row": 4,
  "temperature": 33.73,
  "humidity": 41.75,
  "ambientLight": 165,
  "uvIndex": 0.02,
  "pressure": 993.1,
  "soundNoise": 35.59,
  "discomfortIndex": 81.59,
  "heatStroke": 27.38,
  "batteryVoltage": 2861
}
...
```

The structure of the data passed to the `onsensordata` event handler is as same as the data obtained from the [`getLatestData()`](#EnvsensorDevice-getLatestData-method) method. See the section "[`getLatestData()` method](#EnvsensorDevice-getLatestData-method)" for details.

### <a id="EnvsensorDevice-stopMonitoringData-method">stopMonitoringData() method</a>

The `stopMonitoringData()` method stops monitoring measured data notifications. This method returns a `Promise` object.

```javascript
device.stopMonitoringData().then(() => {
  console.log('Stopped.');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-onsensordata-event-handler">onsensordata event handler</a>

The `onsensordata` event handler will be called whenever a measured data notification is received. 
See the section "[startMonitoringData() method](#EnvsensorDevice-startMonitoringData-method)" for details.


---------------------------------------
## <a id="Advertisement-data">Advertisement data</a>

OMRON Environment Sensor (2JCIE-BL01) has 8 types of beacon mode. The beacon mode affects the local name, the device name, the recording mode, and the format of the advertising packet as follows:

Beacon Mode | Beacon Mode Name        | Local Name | Device Name        | Recording   | ADV format
:-----------|:------------------------|:-----------|:-------------------|:------------|:-----------
`0x00`      | Event Beacon (SCAN RSP) | `"Env"`    | `"EnvSensor-BL01"` | allowed     | (B)
`0x01`      | Standard Beacon         | `"Env"`    | `"EnvSensor-BL01"` | allowed     | (B)
`0x02`      | General Broadcaster 1   | `"IM"`     | `"IM-BL01"`        | not allowed | (D)
`0x03`      | Limited Broadcaster 1   | `"IM"`     | `"IM-BL01"`        | not allowed | (D)
`0x04`      | General Broadcaster 2   | `"EP"`     | `"EP-BL01"`        | not allowed | (E)
`0x05`      | Limited Broadcaster 2   | `"EP"`     | `"EP-BL01"`        | not allowed | (E)
`0x07`      | Alternate Beacon        | `"Env"`    | `"EnvSensor-BL01"` | allowed     | (A)/(B) Alternate
`0x08`      | Event Beacon (ADV)      | `"Env"`    | `"EnvSensor-BL01"` | allowed     | (C)

You can change the beacon mode using the [`setBasicConfigurations()`](#EnvsensorDevice-setBasicConfigurations-method) method as follows:

```javascript
const Envsensor = require('node-omron-envsensor');
const envsensor = new Envsensor();
let device = null;

envsensor.init().then(() => {
  return envsensor.discover({quick: true});
}).then((device_list) => {
  if(device_list.length === 0) {
    throw new Error('No device was found.');
  }
  device = device_list[0];
  return device.connect();
}).then(() => {
  // Set the beacon mode and the measurement interval
  return device.setBasicConfigurations({
    measurementInterval: 1,
    beaconMode: 7
  });
}).then(() => {
  return device.disconnect();
}).then(() => {
  // Set a callback function called when a packet is received
  envsensor.onadvertisement = (ad) => {
    console.log(JSON.stringify(ad, null, '  '));
  };
  // Start to scan advertising packets from the device
  envsensor.startScan();
}).catch((error) => {
  console.error(error);
});
```

The sample code above discovers a device, then changes the beacon mode of the found device, then listens to the measured data notifications in real time. The object passed to the `onadvertisement` event handler consists of the properties as follows:

Property    | Type    | Description
:-----------|:--------|:-----------
`id`        | String  | ID of the device.
`uuid`      | String  | UUID of the device. Basically it is as same as the value of the `id`.
`address`   | String  | Address of the device. Basically it is as same as the value of the `id` except that the `address` includes `:` in the string.
`localName` | String  | Local name. The value depends on the beacon mode (`"Env"`, `"IM"`, or `"EP"`).
`rssi`      | Integer | RSSI.
`companyId` | String  | Company identifier defined by Bluetooth SIG. If the ADV format is (A), this value is `"004c"` (Apple, Inc.). Otherwise, this value is `"02d5"` (OMRON Corporation).
`data`      | Object  | Advertising data. The content depends on the beacon mode. See the following sections for details.

The structures of the `data` are described in the following sections.

### <a id="Advertisement-data-A">(A) Beacon</a>

Example of the advertisement data:

```javascript
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "Env",
  "rssi": -42,
  "companyId": "004c",
  "data": {
    "type": 2,
    "length": 21,
    "uuid": "0C4C3000-7700-46F4-AA96-D5E974E32A54",
    "major": 17,
    "minor": 2,
    "txPower": 195
  }
}
```

Structure of the `data`:

Property    | Type    | Description
:-----------|:--------|:-----------
`type`      | Integer | Beacon type. This value is always `2` which means "iBeacon".
`length`    | Integer | Byte length of the data. This value is always `21` (`0x15`).
`uuid`      | String  | UUID of iBeacon.
`major`     | Integer | If the device is in the recording mode, this value means the latest page number. Otherwise, this value is `0`.
`minor`     | Integer | If the device is in the recording mode, this value means the latest row number. Otherwise, this value is `0`.
`txPower`   | Integer | TX Power.

### <a id="Advertisement-data-B">(B) Connection Advertise 1</a>

Example of the advertisement data:

```javascript
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "Env",
  "rssi": -51,
  "companyId": "02d5",
  "data": {
    "page": 2,
    "row": 4,
    "uniqueId": "0540c920",
    "eventFlag": { ... },
    "temperature": 26.59,
    "humidity": 52.38,
    "ambientLight": 47,
    "pressure": 991.7,
    "soundNoise": 35.59,
    "discomfortIndex": 74.14,
    "heatStroke": 22.97,
    "batteryVoltage": 2790
  }
}
```

Structure of the `data`:

Property          | Type    | Description
:-----------------|:--------|:-----------
`page`            | Integer | If the device is in the recording mode, this value means the latest page number. Otherwise, this value is `0`.
`row`             | Integer | If the device is in the recording mode, this value means the latest row number. Otherwise, this value is `0`.
`uniqueId`        | String  | Unique Identifier.
`temperature`     | Float   | Temperature (degC)
`humidity`        | Float   | Relative Humidity (%RH)
`ambientLight`    | Float   | Ambient Light (lux)
`pressure`        | Float   | Barometric Pressure (hPa)
`soundNoise`      | Float   | Sound noise (dB)
`discomfortIndex` | Float   | Discomfort Index
`heatStroke`      | Float   | Heatstroke risk factor (degC)
`batteryVoltage`  | Integer | Battery voltage (mV)


### <a id="Advertisement-data-C">(C) Connection Advertise 2 (ADV_IND)</a>

Example of the advertisement data:

```javascript
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "Env",
  "rssi": -41,
  "companyId": "02d5",
  "data": {
    "page": 28,
    "row": 8,
    "uniqueId": "0540c920",
    "eventFlag": { ... }
  }
}
```

Structure of the `data`:

Property          | Type    | Description
:-----------------|:--------|:-----------
`page`            | Integer | If the device is in the recording mode, this value means the latest page number. Otherwise, this value is `0`.
`row`             | Integer | If the device is in the recording mode, this value means the latest row number. Otherwise, this value is `0`.
`uniqueId`        | String  | Unique Identifier of the device.

### <a id="Advertisement-data-D">(D) Sensor ADV 1 (ADV_IND)</a>

Example of the advertisement data:

```javascript
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "IM",
  "rssi": -40,
  "companyId": "02d5",
  "data": {
    "sequenceNumber": 7,
    "temperature": 27.02,
    "humidity": 52.28,
    "ambientLight": 51,
    "uvIndex": 0.01,
    "pressure": 991.8,
    "soundNoise": 32.77,
    "accelerationX": -988.5,
    "accelerationY": 17.2,
    "accelerationZ": 28.1,
    "discomfortIndex": 74.69,
    "heatStroke": 23.35,
    "batteryVoltage": 2790
  }
}
```

Structure of the `data`:

Property          | Type    | Description
:-----------------|:--------|:-----------
`sequenceNumber`  | Integer | Sequence number. The value is in the range of `0` to `255`.
`temperature`     | Float   | Temperature (degC)
`humidity`        | Float   | Relative Humidity (%RH)
`ambientLight`    | Float   | Ambient Light (lux)
`uvIndex`         | Float   | UV Index
`pressure`        | Float   | Barometric Pressure (hPa)
`soundNoise`      | Float   | Sound noise (dB)
`accelerationX`   | Float   | Acceleration X (mg)
`accelerationY`   | Float   | Acceleration Y (mg)
`accelerationZ`   | Float   | Acceleration Z (mg)
`discomfortIndex` | Float   | Discomfort Index
`heatStroke`      | Float   | Heatstroke risk factor (degC)
`batteryVoltage`  | Integer | Battery voltage (mV)

### <a id="Advertisement-data-E">(E) Sensor ADV 2 (ADV_IND)</a>

Example of the advertisement data:

```javascript
{
  "id": "ded7723b7199",
  "uuid": "ded7723b7199",
  "address": "de:d7:72:3b:71:99",
  "localName": "EP",
  "rssi": -45,
  "companyId": "02d5",
  "data": {
    "sequenceNumber": 169,
    "temperature": 27.13,
    "humidity": 52.21,
    "ambientLight": 54,
    "uvIndex": 0.01,
    "pressure": 992.1,
    "soundNoise": 34.3,
    "discomfortIndex": 74.83,
    "heatStroke": 23.4,
    "batteryVoltage": 2790
  }
}
```

Structure of the `data`:

Property          | Type    | Description
:-----------------|:--------|:-----------
`sequenceNumber`  | Integer | Sequence number. The value is in the range of `0` to `255`.
`temperature`     | Float   | Temperature (degC)
`humidity`        | Float   | Relative Humidity (%RH)
`ambientLight`    | Float   | Ambient Light (lux)
`uvIndex`         | Float   | UV Index
`pressure`        | Float   | Barometric Pressure (hPa)
`soundNoise`      | Float   | Sound noise (dB)
`discomfortIndex` | Float   | Discomfort Index
`heatStroke`      | Float   | Heatstroke risk factor (degC)
`batteryVoltage`  | Integer | Battery voltage (mV)

---------------------------------------
## <a id="Low-Level-APIs">Low level APIs of `EnvsensorDevice` object</a>

In most cases, with the APIs described in this document, you could achieve what you want to do. If you want to do more sophisticated operations, you can use the low-level APIs implemented in the `EnvsensorDevice` object.

Using the low-level APIs, you can access most of the BLE characteristic implemented in the OMRON Environment Sensor (2JCIE-BL01) directly. See [`README_LOW_LEVEL_API.md`](README_LOW_LEVEL_API.md) for details.

---------------------------------------
## <a id="Release-Note">Release Note</a>

* v0.1.0 (2019-10-24)
  * Supported Node v8 or later versions thanks to [@abandonware/noble](https://github.com/abandonware/noble)
* v0.0.1 (2018-06-02)
  * First public release

---------------------------------------
## <a id="References">References</a>

* [OMRON Environment Sensor (2JCIE-BL01)](https://www.components.omron.com/web/en/solutions/mems-sensors/environment-sensor)
* [OMRON Micro Devices Resources & Samples](https://omronmicrodevices.github.io/)
  * [Environment Sensor 2JCIE-BL01 Communication Interface Manual](https://omronmicrodevices.github.io/products/2jcie-bl01/communication_if_manual.html)
  * [envsensor-observer-py](https://github.com/OmronMicroDevices/envsensor-observer-py)

---------------------------------------
## <a id="License">License</a>

The MIT License (MIT)

Copyright (c) 2018-2019 Futomi Hatano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
