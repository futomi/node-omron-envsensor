Low-Level APIs of the `EnvsensorDevice` object
===============
[[Back to the `README.md`](README.md)]

In most cases, with the APIs described in [`README.md`](README.md), you could achieve what you want to do. If you want to do more sophisticated operations, you can use the low-level APIs implemented in the `EnvsensorDevice` object.

Using the low-level APIs, you can access most of the BLE characteristic implemented in the OMRON Environment Sensor (2JCIE-BL01) directly. This document describes the low-level APIs implemented in the `EnvsensorDevice` object. Basically, each method of low-level APIs corresponds to an operations (READ, WRITE, and NOTIFY) implemented in a BLE characteristic.

See the OMRON official document ["Environment Sensor 2JCIE-BL01 Communication Interface Manual](https://omronmicrodevices.github.io/products/2jcie-bl01/communication_if_manual.html) for details of the BLE communication Interface.

---------------------------------------
## Table of Contents

* [Sensor Service (Service UUID: 0x3000)](#Sensor-Service)
  * [`getLatestPage()` method (Characteristics UUID: 0x3002, Read)](#EnvsensorDevice-getLatestPage-method)
  * [`getRequestPage()` method (Characteristics UUID: 0x3003, Read)](#EnvsensorDevice-getRequestPage-method)
  * [`setRequestPage()` method (Characteristics UUID: 0x3003, Write)](#EnvsensorDevice-setRequestPage-method)
  * [`getResponseFlag()` method (Characteristics UUID: 0x3004, Read)](#EnvsensorDevice-getResponseFlag-method)
  * [`getResponseData()` method (Characteristics UUID: 0x3005, Read)](#EnvsensorDevice-getResponseData-method)
  * [`startMonitoringEventFlag()` method (Characteristics UUID: 0x3006, Notify)](#EnvsensorDevice-startMonitoringEventFlag-method)
  * [`stopMonitoringEventFlag()` method (Characteristics UUID: 0x3006, Notify)](#EnvsensorDevice-stopMonitoringEventFlag-method)
  * [ `oneventflag` event handler (Characteristics UUID: 0x3006, Notify)](#EnvsensorDevice-oneventflag-event-handler)
  * [`getEventFlag()` method (Characteristics UUID: 0x3006, Read)](#EnvsensorDevice-getEventFlag-method)
* [Setting Service (Service UUID: 0x3010)](#Setting-Service)
  * [`getMeasurementInterval()` method (Characteristics UUID: 0x3011, Read)](#EnvsensorDevice-getMeasurementInterval-method)
  * [`setMeasurementInterval()` method (Characteristics UUID: 0x3011, Write)](#EnvsensorDevice-setMeasurementInterval-method)
  * [`getEventSettingsTemperature()` method (Characteristics UUID: 0x3013, Read)](#EnvsensorDevice-getEventSettingsTemperature-method)
  * [`setEventSettingsTemperature()` method (Characteristics UUID: 0x3013, Write)](#EnvsensorDevice-setEventSettingsTemperature-method)
  * [`getEventSettingsHumidity()` method (Characteristics UUID: 0x3014, Read)](#EnvsensorDevice-getEventSettingsHumidity-method)
  * [`setEventSettingsHumidity()` method (Characteristics UUID: 0x3014, Write)](#EnvsensorDevice-setEventSettingsHumidity-method)
  * [`getEventSettingsAmbientlight()` method (Characteristics UUID: 0x3015, Read)](#EnvsensorDevice-getEventSettingsAmbientlight-method)
  * [`setEventSettingsAmbientlight()` method (Characteristics UUID: 0x3015, Write)](#EnvsensorDevice-setEventSettingsAmbientlight-method)
  * [`getEventSettingsUvIndex()` method (Characteristics UUID: 0x3016, Read)](#EnvsensorDevice-getEventSettingsUvIndex-method)
  * [`setEventSettingsUvIndex()` method (Characteristics UUID: 0x3016, Write)](#EnvsensorDevice-setEventSettingsUvIndex-method)
  * [`getEventSettingsPressure()` method (Characteristics UUID: 0x3017, Read)](#EnvsensorDevice-getEventSettingsPressure-method)
  * [`setEventSettingsPressure()` method (Characteristics UUID: 0x3017, Write)](#EnvsensorDevice-setEventSettingsPressure-method)
  * [`getEventSettingsSoundNoise()` method (Characteristics UUID: 0x3018, Read)](#EnvsensorDevice-getEventSettingsSoundNoise-method)
  * [`setEventSettingsSoundNoise()` method (Characteristics UUID: 0x3018, Write)](#EnvsensorDevice-setEventSettingsSoundNoise-method)
  * [`getEventSettingsDiscomfortIndex()` method (Characteristics UUID: 0x3019, Read)](#EnvsensorDevice-getEventSettingsDiscomfortIndex-method)
  * [`setEventSettingsDiscomfortIndex()` method (Characteristics UUID: 0x3019, Write)](#EnvsensorDevice-setEventSettingsDiscomfortIndex-method)
  * [`getEventSettingsHeatStroke()` method (Characteristics UUID: 0x301A, Read)](#EnvsensorDevice-getEventSettingsHeatStroke-method)
  * [`setEventSettingsHeatStroke()` method (Characteristics UUID: 0x301A, Write)](#EnvsensorDevice-setEventSettingsHeatStroke-method)
* [Control Service (Service UUID: 0x3030)](#Control-Service)
  * [`getTime()` method (Characteristics UUID: 0x3031, Read)](#EnvsensorDevice-getTime-method)
  * [`setTime()` method (Characteristics UUID: 0x3031, Write)](#EnvsensorDevice-setTime-method)
  * [`turnOnLed()` method (Characteristics UUID: 0x3032, Write)](#EnvsensorDevice-turnOnLed-method)
  * [`getErrorStatus()` method (Characteristics UUID: 0x3033, Read)](#EnvsensorDevice-getErrorStatus-method)
  * [`resetErrorStatus()` method (Characteristics UUID: 0x3033, Write)](#EnvsensorDevice-resetErrorStatus-method)
* [Parameter Service (Service UUID: 0x3040)](#Parameter-Service)
  * [`getUuid()` method (Characteristics UUID: 0x3041, Read)](#EnvsensorDevice-getUuid-method)
  * [`setUuid()` method (Characteristics UUID: 0x3041, Write)](#EnvsensorDevice-setUuid-method)
  * [`getAdvSetting()` method (Characteristics UUID: 0x3042, Read)](#EnvsensorDevice-getAdvSetting-method)
  * [`setAdvSetting()` method (Characteristics UUID: 0x3042, Write)](#EnvsensorDevice-setAdvSetting-method)
* [DFU Service (Service UUID: 0x3050)](#DFU-Service)
  * [`getDfuRevision()` method (Characteristics UUID: 0x3053, Read)](#EnvsensorDevice-getDfuRevision-method)
* [Generic Access Service (Service UUID: 0x1800)](#Generic-Access-Service)
  * [`getDeviceName()` method (Characteristics UUID: 0x2A00, Read)](#EnvsensorDevice-getDeviceName-method)
  * [`getAppearance()` method (Characteristics UUID: 0x2A01, Read)](#EnvsensorDevice-getAppearance-method)
  * [`getConnectionParameters()` method (Characteristics UUID: 0x2A04, Read)](#EnvsensorDevice-getConnectionParameters-method)
* [Device Information Service (Service UUID: 0x180A)](#Device-Information-Service)
  * [`getModelNumber()` method (Characteristics UUID: 0x2A24, Read)](#EnvsensorDevice-getModelNumber-method)
  * [`getSerialNumber()` method (Characteristics UUID: 0x2A25, Read)](#EnvsensorDevice-getSerialNumber-method)
  * [`getFirmwareRevision()` method (Characteristics UUID: 0x2A26, Read)](#EnvsensorDevice-getFirmwareRevision-method)
  * [`getHardwareRevision()` method (Characteristics UUID: 0x2A27, Read)](#EnvsensorDevice-getHardwareRevision-method)
  * [`getManufacturerName()` method (Characteristics UUID: 0x2A29, Read)](#EnvsensorDevice-getManufacturerName-method)

---------------------------------------
## <a id="Sensor-Service">Sensor Service (Service UUID: 0x3000)</a>

*[Note] The APIs for the Latest data (Characteristics UUID: 0x3001) are described in the [`README.md`](README.md). See the sections "[`getLatestData()` method](README.md#EnvsensorDevice-getLatestData-method)", "[`startMonitoringData()` method](README.md#EnvsensorDevice-startMonitoringData-method)", "[`stopMonitoringData()` method](README.md#EnvsensorDevice-stopMonitoringData-method)", and "[`onsensordata` event handler](README.md#EnvsensorDevice-onsensordata-event-handler) in the [`README.md`](README.md).*

### <a id="EnvsensorDevice-getLatestPage-method">getLatestPage() method (Characteristics UUID: 0x3002, Read)</a>

The `getLatestPage()` method fetches the latest information related to the recording mode. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property              | Type    | Description
:---------------------|:--------|:-----------
`unixTime`            | Integer | Created time of the latest page. The value is a UNIX time. The unit is second. If The recording mode is disabled, this value is set to `0`.
`measurementInterval` | Integer | Measurement interval. The unit is second. The value is in the range of `1` to `3600`.
`page`                | Integer | Latest page number. The value is in the range of 0 to 2047. If The recording mode is disabled, this value is set to `0`.
`row`                 | Integer | Latest row number. The value is in the range of 0 to 12. If The recording mode is disabled, this value is set to `0`.

```javascript
device.getLatestPage().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "unixTime": 1527770486,
  "measurementInterval": 3,
  "page": 11,
  "row": 2
}
```

### <a id="EnvsensorDevice-getRequestPage-method">getRequestPage() method (Characteristics UUID: 0x3003, Read)</a>

The `getRequestPage()` method fetches the information related to the request page and row. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property | Type    | Description
:--------|:--------|:-----------
`page`   | Integer | Requesting Page Number.
`row`    | Integer | Requesting Row Number.

```javascript
device.getRequestPage().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "page": 2,
  "row": 12
}
```

### <a id="EnvsensorDevice-setRequestPage-method">setRequestPage() method (Characteristics UUID: 0x3003, Write)</a>

The `setRequestPage()` method sets the request page and row to the specified page number and row number. This method is called, the records in the page are retrieved and saved in a certain area in the flash memory so that the records can be retrieved using [`getResponseData()`](#EnvsensorDevice-getResponseData-method) method. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property | Type    | Required | Description
:--------|:--------|:---------|:-----------
`page`   | Integer | Required | Requesting Page Number. The value must be in the range of 0 to 2047.
`row`    | Integer | Required | Requesting Row Number. The value must be in the range of 0 to 12.

```javascript
device.setRequestPage({page: 1, row: 2}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getResponseFlag-method">getResponseFlag() method (Characteristics UUID: 0x3004, Read)</a>

The `getResponseFlag()` method reports whether the requesting page and row are updated successfully triggered by the [`setRequestPage()`](#EnvsensorDevice-setRequestPage-method") method. This method returns a `Promise` object.

You do not have to call this method whenever changing the request row in the same page because the information retrieved by this method is updated when the request page is changed. 

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property     | Type    | Description
:------------|:--------|:-----------
`updateFlag` | Integer | The status of updating the requesting page and row. (`0x01`: Retrieving, `0x01`: Completed, `0x02`: Failed to retrieve data)
`unixTime`   | Integer | Created time of the requested page. The value is a UNIX time. The unit is second.

```javascript
device.getResponseFlag().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "updateFlag": 1,
  "unixTime": 1527770699
}
```

### <a id="EnvsensorDevice-getResponseData-method">getResponseData() method (Characteristics UUID: 0x3005, Read)</a>

The `getResponseData()` method fetches the record saved in the requested page and row. This method returns a `Promise` object.

If this method is finished successfully, the request row will be decremented automatically. Note that this method does not decrement the request row number. The device decrements it. So you do not have to call the [`setRequestPage()`](#EnvsensorDevice-setRequestPage-method) method to move the request row in the same page. At first, you should set the request row to 12 using the [`setRequestPage()`](#EnvsensorDevice-setRequestPage-method) method. Then you can retrieve all records in the request page just calling this method 12 times.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`row`             | Integer | Requested row number.
`temperature`     | Float   | Temperature. The unit is degC.
`humidity`        | Float   | Relative Humidity. The unit is %RH.
`ambientLight`    | Float   | Ambient Light. The unit is lux.
`uvIndex`         | Float   | UV Index.
`pressure`        | Float   | Barometric Pressure. The unit is hPa.
`soundNoise`      | Float   | Sound noise. The unit is dB.
`discomfortIndex` | Float   | Discomfort Index.
`heatStroke`      | Float   | Heatstroke risk factor. The unit is degC.
`batteryVoltage`  | Integer | Battery voltage. The unit is mV.

```javascript
device.getResponseData().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "row": 2,
  "temperature": 24.64,
  "humidity": 50.73,
  "ambientLight": 50,
  "uvIndex": 0.01,
  "pressure": 993.5,
  "soundNoise": 42.62,
  "discomfortIndex": 71.37,
  "heatStroke": 20.96,
  "batteryVoltage": 2770
}
```

### <a id="EnvsensorDevice-startMonitoringEventFlag-method">startMonitoringEventFlag() method (Characteristics UUID: 0x3006), Notify</a>

The `startMonitoringEventFlag()` method starts monitoring the state of occurrence of various events. in real time. This method returns a `Promise` object.

If it starts monitoring successfully, the [`oneventflag`](#EnvsensorDevice-oneventflag-event-handler) event handler will be called whenever a notification is received.

```javascript
device.oneventflag = (data) => {
  console.log(JSON.stringify(data, null, '  '));
};
device.startMonitoringEventFlag().then(() => {
  console.log('Started.');
}).catch((error) => {
  console.error(error);
});
```

The structure of the data passed to the `onsensordata` event handler is as same as the data obtained from the [`getEventFlag()`](#EnvsensorDevice-getEventFlag-method) method. See the section "[`getEventFlag()` method](#EnvsensorDevice-getEventFlag-method)" for details.

### <a id="EnvsensorDevice-stopMonitoringEventFlag-method">stopMonitoringEventFlag() method (Characteristics UUID: 0x3006, Notify)</a>

The `stopMonitoringEventFlag()` method stops monitoring the state of occurrence of various events. This method returns a `Promise` object.

```javascript
device.stopMonitoringEventFlag().then(() => {
  console.log('Stopped.');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-oneventflag-event-handler">oneventflag event handler</a>

The `oneventflag` event handler will be called whenever a event notification is received. 
See the section "[startMonitoringEventFlag() method](#EnvsensorDevice-startMonitoringEventFlag-method)" for details.

### <a id="EnvsensorDevice-getEventFlag-method">getEventFlag() method (Characteristics UUID: 0x3006, Read)</a>

The `getResponseData()` method fetches the state of occurrence of various events. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property                | Type    | Description
:-----------------------|:--------|:-----------
`temperature`           | Object  | States of occurrence of various events for temperature.
`humidity`              | Object  | States of occurrence of various events for relative humidity.
`ambientLight`          | Object  | States of occurrence of various events for ambient light.
`uvIndex`               | Object  | States of occurrence of various events for UV index.
`pressure`              | Object  | States of occurrence of various events for barometric Pressure.
`soundNoise`            | Object  | States of occurrence of various events for sound noise.
`discomfortIndex`       | Object  | States of occurrence of various events for discomfort index.
`heatStroke`            | Object  | States of occurrence of various events for heatstroke risk factor.
`others`                | Object  |
+- `batteryReplacement` | Boolean | Battery replacement.

The object of the `temperature`, `humidity`, `ambientLight`, `uvIndex`, `pressure`, `soundNoise`, `discomfortIndex`, and `heatStroke` contain the properties as follows:

Property         | Type    | Description
:----------------|:--------|:-----------
`lowerLimit`     | Boolean | Simple threshold [lower limit]
`upperLimit`     | Boolean | Simple threshold [upper limit]
`declineTerm`    | Boolean | Changing trend [decline/term]
`riseTerm`       | Boolean | Changing trend [rise/term]
`declinePrevious`| Boolean | Changing trend [decline/previous]
`risePrevious`   | Boolean | Changing trend [rise/previous]

```javascript
device.getEventFlag().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "temperature": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "humidity": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "ambientLight": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "uvIndex": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "pressure": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "soundNoise": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "discomfortIndex": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "heatStroke": {
    "lowerLimit": false,
    "upperLimit": false,
    "declineTerm": false,
    "riseTerm": false,
    "declinePrevious": false,
    "risePrevious": false
  },
  "others": {
    "batteryReplacement": false
  }
}
```

---------------------------------------
## <a id="Setting-Service">Setting Service (Service UUID: 0x3010)</a>

### <a id="EnvsensorDevice-getMeasurementInterval-method">getMeasurementInterval() method (Characteristics UUID: 0x3011, Read)</a>

The `getMeasurementInterval()` method fetches the measurement interval. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property | Type    | Description
:--------|:--------|:-----------
`measurementInterval` | Integer | Measurement interval. The unit is second. The value is in the range of `1` to `3600`.

```javascript
device.getMeasurementInterval().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "measurementInterval": 3
}
```

### <a id="EnvsensorDevice-setMeasurementInterval-method">setMeasurementInterval() method (Characteristics UUID: 0x3011, Write)</a>

The `setMeasurementInterval()` method sets the measurement interval. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property              | Type    | Required | Description
:---------------------|:--------|:---------|:-----------
`measurementInterval` | Integer | Required | Measurement interval. The unit is second. The value must be in the range of `1` to `3600`. 

```javascript
device.setMeasurementInterval({ measurementInterval: 1 }).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsTemperature-method">getEventSettingsTemperature() method (Characteristics UUID: 0x3013, Read)</a>

The `getEventSettingsTemperature()` method fetches the temperature sensor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (-10.00 to 60.00 degC)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (-10.00 to 60.00 degC)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsTemperature().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 10
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 35
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 2
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 2
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 2
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 2
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsTemperature-method">setEventSettingsTemperature() method (Characteristics UUID: 0x3013, Write)</a>

The `setEventSettingsTemperature()` method sets the temperature sensor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (-10.00 to 60.00 degC)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (-10.00 to 60.00 degC)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsTemperature({
  "lowerLimit": {
    "enabled": false,
    "threshold": 10
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 35
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 2
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 2
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 2
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 2
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsHumidity-method">getEventSettingsHumidity() method (Characteristics UUID: 0x3014, Read)</a>

The `getEventSettingsHumidity()` method fetches the humidity sensor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.00 to 100.00 %RH)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.00 to 100.00 %RH)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 %RH)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 %RH)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 %RH)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 %RH)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsHumidity().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 35
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 80
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 5
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 5
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsHumidity-method">setEventSettingsHumidity() method (Characteristics UUID: 0x3014, Write)</a>

The `setEventSettingsHumidity()` method sets the humidity sensor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.00 to 100.00 %RH)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.00 to 100.00 %RH)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 %RH)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 %RH)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 %RH)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 %RH)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsHumidity({
  "lowerLimit": {
    "enabled": false,
    "threshold": 35
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 80
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 5
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 5
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsAmbientlight-method">getEventSettingsAmbientlight() method (Characteristics UUID: 0x3015, Read)</a>

The `getEventSettingsAmbientlight()` method fetches the light sensor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (10 to 10000 lx)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (10 to 10000 lx)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (1 to 2000 lx)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (1 to 2000 lx)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (1 to 2000 lx)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Integer | Threshold (1 to 2000 lx)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsAmbientlight().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 10
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 2000
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 200
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 200
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 200
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 200
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsAmbientlight-method">setEventSettingsAmbientlight() method (Characteristics UUID: 0x3015, Write)</a>

The `setEventSettingsAmbientlight()` method sets the light sensor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (10 to 10000 lx)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (10 to 10000 lx)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (1 to 2000 lx)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (1 to 2000 lx)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (1 to 2000 lx)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (1 to 2000 lx)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsAmbientlight({
  "lowerLimit": {
    "enabled": false,
    "threshold": 10
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 2000
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 200
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 200
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 200
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 200
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsUvIndex-method">getEventSettingsUvIndex() method (Characteristics UUID: 0x3016, Read)</a>

The `getEventSettingsUvIndex()` method fetches the UV sensor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (Index 0.00 to 11.00)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsUvIndex().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 0
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 6
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 3
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 3
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsUvIndex-method">setEventSettingsUvIndex() method (Characteristics UUID: 0x3016, Write)</a>

The `setEventSettingsUvIndex()` method sets the UV sensor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (Index 0.00 to 11.00)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsUvIndex({
  "lowerLimit": {
    "enabled": false,
    "threshold": 0
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 6
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 3
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 3
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsPressure-method">getEventSettingsPressure() method (Characteristics UUID: 0x3017, Read)</a>

The `getEventSettingsPressure()` method fetches the barometric pressure sensor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (700.0 to 1100.0 hPa)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (700.0 to 1100.0 hPa)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.1 to 200.0 hPa)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.1 to 200.0 hPa)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.1 to 200.0 hPa)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.1 to 200.0 hPa)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsPressure().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 700
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 1100
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 5
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 5
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsPressure-method">setEventSettingsPressure() method (Characteristics UUID: 0x3017, Write)</a>

The `setEventSettingsPressure()` method sets the barometric pressure sensor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (700.0 to 1100.0 hPa)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (700.0 to 1100.0 hPa)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.1 to 200.0 hPa)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.1 to 200.0 hPa)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.1 to 200.0 hPa)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.1 to 200.0 hPa)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsPressure({
  "lowerLimit": {
    "enabled": false,
    "threshold": 700
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 1100
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 5
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 5
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 5
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsSoundNoise-method">getEventSettingsSoundNoise() method (Characteristics UUID: 0x3018, Read)</a>

The `getEventSettingsSoundNoise()` method fetches the Microphone related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (40.00 to 85.00 dB)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (40.00 to 85.00 dB)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 dB)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 dB)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 dB)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00 dB)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsSoundNoise().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 40
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 70
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 20
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 20
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 20
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 20
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsSoundNoise-method">setEventSettingsSoundNoise() method (Characteristics UUID: 0x3018, Write)</a>

The `setEventSettingsSoundNoise()` method sets the microphone related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (40.00 to 85.00 dB)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (40.00 to 85.00 dB)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 dB)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 dB)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 dB)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00 dB)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsSoundNoise({
  "lowerLimit": {
    "enabled": false,
    "threshold": 40
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 70
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 20
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 20
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 20
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 20
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsDiscomfortIndex-method">getEventSettingsDiscomfortIndex() method (Characteristics UUID: 0x3019, Read)</a>

The `getEventSettingsDiscomfortIndex()` method fetches the discomfort index related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (55.00 to 85.00)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (55.00 to 85.00)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 50.00)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsDiscomfortIndex().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 55
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 80
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 10
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 10
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 10
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 10
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsDiscomfortIndex-method">setEventSettingsDiscomfortIndex() method (Characteristics UUID: 0x3019, Write)</a>

The `setEventSettingsDiscomfortIndex()` method sets the discomfort index related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (55.00 to 85.00)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (55.00 to 85.00)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 50.00)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsDiscomfortIndex({
  "lowerLimit": {
    "enabled": false,
    "threshold": 55
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 80
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 10
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 10
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 10
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 10
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getEventSettingsHeatStroke-method">getEventSettingsHeatStroke() method (Characteristics UUID: 0x301A, Read)</a>

The `getEventSettingsHeatStroke()` method fetches the heatstroke risk factor related event settings. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property          | Type    | Description
:-----------------|:--------|:-----------
`lowerLimit`      | Object  | Simple threshold [lower limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (25 to 40 degC)
`upperLimit`      | Object  | Simple threshold [upper limit]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (25 to 40 degC)
`declineTerm`     | Object  | Changing trend [decline/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`riseTerm`        | Object  | Changing trend [rise/term]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`declinePrevious` | Object  | Changing trend [decline/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`risePrevious`    | Object  | Changing trend [rise/previous]
+- `enabled`      | Boolean | Event Enable/Disable
+- `threshold`    | Float   | Threshold (0.01 to 30.00 degC)
`measurements`    | Integer | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Moving average number (1 to 8)

```javascript
device.getEventSettingsHeatStroke().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "lowerLimit": {
    "enabled": false,
    "threshold": 25
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 28
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 3
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 3
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "measurements": 6,
  "movingAverage": 1
}
```

### <a id="EnvsensorDevice-setEventSettingsHeatStroke-method">setEventSettingsHeatStroke() method (Characteristics UUID: 0x301A, Write)</a>

The `setEventSettingsHeatStroke()` method sets the heatstroke risk factor related event settings. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property          | Type    | Required | Description
:-----------------|:--------|:---------|:-----------
`lowerLimit`      | Object  | Optional | Simple threshold [lower limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (25 to 40 degC)
`upperLimit`      | Object  | Optional | Simple threshold [upper limit]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (25 to 40 degC)
`declineTerm`     | Object  | Optional | Changing trend [decline/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`riseTerm`        | Object  | Optional | Changing trend [rise/term]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`declinePrevious` | Object  | Optional | Changing trend [decline/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`risePrevious`    | Object  | Optional | Changing trend [rise/previous]
+- `enabled`      | Boolean | Optional | Event Enable/Disable
+- `threshold`    | Float   | Optional | Threshold (0.01 to 30.00 degC)
`measurements`    | Integer | Optional | Term for changing trend (Number of Measurements) (1 to 8)
`movingAverage`   | Integer | Optional | Moving average number (1 to 8)

Note that at least one property must be specified though all properties are optional.

```javascript
device.setEventSettingsHeatStroke({
  "lowerLimit": {
    "enabled": false,
    "threshold": 25
  },
  "upperLimit": {
    "enabled": false,
    "threshold": 28
  },
  "declineTerm": {
    "enabled": false,
    "threshold": 3
  },
  "riseTerm": {
    "enabled": false,
    "threshold": 3
  },
  "declinePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "risePrevious": {
    "enabled": false,
    "threshold": 3
  },
  "measurements": 6,
  "movingAverage": 1
}).then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

---------------------------------------
## <a id="Control-Service">Control Service (Service UUID: 0x3030)</a>

### <a id="EnvsensorDevice-getTime-method">getTime() method (Characteristics UUID: 0x3031, Read)</a>

The `getTime()` method fetches the UNIX time set to the device for recording data. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property   | Type    | Description
:----------|:--------|:-----------
`unixTime` | Integer | The UNIX time. The unit is second.

```javascript
device.getTime().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "unixTime": 1527777379
}
```

### <a id="EnvsensorDevice-setTime-method">setTime() method (Characteristics UUID: 0x3031, Write)</a>

The `setTime()` method sets the UNIX time for recording data. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property   | Type    | Required | Description
:----------|:--------|:---------|:-----------
`unixTime` | Integer | Optional | UNIX time. The unit is seconds. The value must be grater than 0. If this property is not specified, the current time is applied.

```javascript
device.setTime().then((data) => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-turnOnLed-method">turnOnLed() method (Characteristics UUID: 0x3032, Write)</a>

The `turnOnLed()` method turns on the green LED on the device. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property   | Type    | Required | Description
:----------|:--------|:---------|:-----------
`duration` | Integer | Optional | LED on duration. The unit is second. The value must be in the range of 1 to 10 sec. If this property is not specified, the default value (3 sec) is applied.

```javascript
device.turnOnLed({ duration: 5 }).then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getErrorStatus-method">getErrorStatus() method (Characteristics UUID: 0x3033, Read)</a>

The `getErrorStatus()` method fetches the error status of the sensors in the device. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property           | Type    | Description
:------------------|:--------|:-----------
`sensor`           | Object  | Sensor Status
+- `accelerometer` | Boolean | Error: Accelerometer
+- `microphone`    | Boolean | Error: Microphone 
+- `pressure`      | Boolean | Error: Barometric Pressure sensor
+- `uv`            | Boolean | Error: UV sensor
+- `light`         | Boolean | Error: Light sensor
+- `humidity`      | Boolean | Error: Humidity sensor
+- `temperature`   | Boolean | Error: Temperature sensor
`cpu`              | Object  | CPU Status
+- `boot`          | Boolean | Boot default setting
+- `flash`         | Boolean | Flash memory verify error
`battery`          | Object  | Battery Status
+- `read`          | Boolean | Error in reading battery voltage
+- `low`           | Boolean | Battery Low

The type of each property is boolean. If an error occurred, the value is set to `true`.


```javascript
device.getTime().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "sensor": {
    "accelerometer": false,
    "microphone": false,
    "pressure": false,
    "uv": false,
    "light": false,
    "humidity": false,
    "temperature": false
  },
  "cpu": {
    "boot": false,
    "flash": false
  },
  "battery": {
    "read": false,
    "low": false
  }
}
```

### <a id="EnvsensorDevice-resetErrorStatus-method">resetErrorStatus() method (Characteristics UUID: 0x3033, Write)</a>

The `resetErrorStatus()` method reset the error status. That is, this method set all error status values to `false`. This method returns a `Promise` object.

```javascript
device.resetErrorStatus().then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

---------------------------------------
## <a id="Parameter-Service">Parameter Service (Service UUID: 0x3040)</a>

### <a id="EnvsensorDevice-getUuid-method">getUuid() method (Characteristics UUID: 0x3041, Read)</a>

The `getUuid()` method fetches the UUID used for the (A) type beacon (iBeacon compatible beacon). This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property  | Type    | Description
:---------|:--------|:-----------
`uuid`    | String  | UUID.
`major`   | Integer | Major number.
`minor`   | Integer | Minor number.

Note that the values of the `major` and the `minor` are `0` by default. Though these values can be set using the [`setUuid()`](#EnvsensorDevice-setUuid-method) method, the values are not used for the iBeacon compatible beacon. That is, setting these values are meaningless.

```javascript
device.getUuid().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "uuid": "0C4C3000-7700-46F4-AA96D5E974E32A54",
  "major": 0,
  "minor": 0
}
```

### <a id="EnvsensorDevice-setUuid-method">setUuid() method (Characteristics UUID: 0x3041, Write)</a>

The `setUuid()` method sets the UUID used for the (A) type beacon (iBeacon compatible beacon). This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property | Type    | Required | Description
:--------|:--------|:---------|:-----------
`uuid`   | String  | Optional | UUID.
`major`  | Integer | Optional | Major number.
`minor`  | Integer | Optional | Minor number.

Though the values of the `major` and `minor` can be set technically, the values are not used for the iBeacon compatible beacon. That is, setting these values are meaningless.

```javascript
device.setUuid({
  uuid: '0C4C3000-7700-46F4-AA96D5E974E32A54',
  major: 0,
  minor: 0
}).then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

### <a id="EnvsensorDevice-getAdvSetting-method">getAdvSetting() method (Characteristics UUID: 0x3042, Read)</a>

The `getAdvSetting()` method fetches the advertisement related parameters. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property             | Type    | Description
:--------------------|:--------|:-----------
`indInterval`        | Integer | Advertise interval. The value is in the range of 500 to 10240 (msec).
`nonconIndInterval`  | Integer | ADV_NONCON_IND Advertise interval. The value is in the range of 100 to 10240 (msec).
`transmissionPeriod` | Integer | Transmission period in Limited Broadcaster. The value is in the range of 1 to 16383 (sec).
`silentPeriod`       | Integer | Silent period in Limited Broadcaster. The value is in the range of 1 to 16383 (sec). 
`beaconMode`         | Integer | Beacon Mode. The value is 0, 1, 2, 3, 4, 5, 7, or 8.
`txPowerLevel`       | Integer | Tx Power. The value is -20, -16, -12, -8, -4, 0, or 4. 

```javascript
device.getAdvSetting().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "indInterval": 1000,
  "nonconIndInterval": 100,
  "transmissionPeriod": 10,
  "silentPeriod": 50,
  "beaconMode": 4,
  "txPowerLevel": 0
}
```

### <a id="EnvsensorDevice-setAdvSetting-method">setAdvSetting() method (Characteristics UUID: 0x3042, Write)</a>

The `setAdvSetting()` method sets the advertisement related parameters. This method returns a `Promise` object.

This method takes a hash object as an argument containing properties as follows:

Property             | Type    | Required | Description
:--------------------|:--------|:---------|:-----------
`indInterval`        | String  | Optional | ADV_IND Advertise interval. The value must be in the range of 500 to 10240 (msec).
`nonconIndInterval`  | Integer | Optional | ADV_NONCON_IND Advertise interval. The value must be in the range of 100 to 10240 (msec).
`transmissionPeriod` | Integer | Optional | Transmission period in Limited Broadcaster. The value must be in the range of 1 to 16383 (sec).
`silentPeriod`       | Integer | Optional | Silent period in Limited Broadcaster. The value must be in the range of 1 to 16383 (sec).
`beaconMode`         | Integer | Optional | Beacon Mode. The value must be 0, 1, 2, 3, 4, 5, 7, or 8.
`txPowerLevel`       | Integer | Optional | Tx Power. The value must be -20, -16, -12, -8, -4, 0, or 4.

Note that at least one property is required though all properties are optional.

```javascript
device.setAdvSetting({
  indInterval: 1285,
  nonconIndInterval: 100,
  transmissionPeriod: 10,
  silentPeriod: 50,
  beaconMode: 8,
  txPowerLevel: 0
}).then(() => {
  console.log('OK');
}).catch((error) => {
  console.error(error);
});
```

---------------------------------------
## <a id="DFU-Service">DFU Service (Service UUID: 0x3050)</a>

### <a id="EnvsensorDevice-getDfuRevision-method">getDfuRevision() method (Characteristics UUID: 0x3053, Read)</a>

The `getDfuRevision()` method fetches the DFU (Device Firmware Update) revision. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property        | Type    | Description
:---------------|:--------|:-----------
`"dfuRevision"` | Integer | DFU revision.

```javascript
device.getDfuRevision().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "dfuRevision": 1
}
```

---------------------------------------
## <a id="Generic-Access-Service">Generic Access Service (Service UUID: 0x1800)</a>

### <a id="EnvsensorDevice-getDeviceName-method">getDeviceName() method (Characteristics UUID: 0x2A00, Read)</a>

The `getDeviceName()` method fetches the device name. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property     | Type   | Description
:------------|:-------|:-----------
`deviceName` | String | Device name. If the beacon mode is `0`, `1`, `7`, or `8`, the name is `"EnvSensor-BL01"`. If the beacon mode is `2` or `3`, the name is `"IM-BL01"`. If the beacon mode is `4` or `5`, the name is `"EP-BL01"`.

```javascript
device.getDeviceName().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "deviceName": "EnvSensor-BL01"
}
```

### <a id="EnvsensorDevice-getAppearance-method">getAppearance() method (Characteristics UUID: 0x2A01, Read)</a>

The `getAppearance()` method fetches the category. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property   | Type    | Description
:----------|:--------|:-----------
`category` | Integer | Category code. This value is always `0` (Unknown).

```javascript
device.getAppearance().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "category": 0
}
```

### <a id="EnvsensorDevice-getConnectionParameters-method">getConnectionParameters() method (Characteristics UUID: 0x2A04, Read)</a>

The `getConnectionParameters()` method fetches the peripheral preferred connection parameters. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property                                 | Type    | Description
:----------------------------------------|:--------|:-----------
`minimumConnectionInterval`              | Integer | Minimum connection interval. The unit is msec.
`maximumConnectionInterval`              | Integer | Maximum connection interval. The unit is msec.
`slaveLatency`                           | Integer | Slave Latency.
`connectionSupervisionTimeoutMultiplier` | Integer | Connection Supervision Timeout Multiplier. The unit is msec.

```javascript
device.getAppearance().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "minimumConnectionInterval": 25,
  "maximumConnectionInterval": 50,
  "slaveLatency": 4,
  "connectionSupervisionTimeoutMultiplier": 4000
}
```

---------------------------------------
## <a id="Device-Information-Service">Device Information Service (Service UUID: 0x180A)</a>

### <a id="EnvsensorDevice-getModelNumber-method">getModelNumber() method (Characteristics UUID: 0x2A24, Read)</a>

The `getModelNumber()` method fetches the model number This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property      | Type   | Description
:-------------|:-------|:-----------
`modelNumber` | String | Model Number. The value is always `"2JCIE-BL01"`.

```javascript
device.getAppearance().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "modelNumber": "2JCIE-BL01"
}
```

### <a id="EnvsensorDevice-getSerialNumber-method">getSerialNumber() method (Characteristics UUID: 0x2A25, Read)</a>

The `getSerialNumber()` method fetches the serial number This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property       | Type   | Description
:--------------|:-------|:-----------
`serialNumber` | String | Serial Number.

```javascript
device.getAppearance().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "serialNumber": "0586MY0005"
}
```

### <a id="EnvsensorDevice-getFirmwareRevision-method">getFirmwareRevision() method (Characteristics UUID: 0x2A26, Read)</a>

The `getFirmwareRevision()` method fetches the firmware revision. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property           | Type   | Description
:------------------|:-------|:-----------
`firmwareRevision` | String | Firmware Revision.

```javascript
device.getFirmwareRevision().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "firmwareRevision": "01.09"
}
```

### <a id="EnvsensorDevice-getHardwareRevision-method">getHardwareRevision() method (Characteristics UUID: 0x2A27, Read)</a>

The `getHardwareRevision()` method fetches the hardware revision. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property           | Type   | Description
:------------------|:-------|:-----------
`hardwareRevision` | String | Hardware Revision.

```javascript
device.getFirmwareRevision().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "hardwareRevision": "01.01"
}
```

### <a id="EnvsensorDevice-getManufacturerName-method">getManufacturerName() method (Characteristics UUID: 0x2A29, Read)</a>


The `getManufacturerName()` method fetches the manufacturer name. This method returns a `Promise` object.

If this method is executed successfully, a hash object containing the status will be passed to the `resolve()` function. The hash object has the properties as follows:

Property           | Type   | Description
:------------------|:-------|:-----------
`manufacturerName` | String | Manufacturer Name.

```javascript
device.getManufacturerName().then((data) => {
  console.log(JSON.stringify(data, null, '  '));
}).catch((error) => {
  console.error(error);
});
```

The code snippet above will output the result as follows:

```javascript
{
  "manufacturerName": "OMRON"
}
```

---------------------------------------
[[Back to the `README.md`](README.md)]