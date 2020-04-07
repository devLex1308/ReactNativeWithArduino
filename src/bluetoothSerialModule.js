// @flow
import BluetoothSerial from 'react-native-bluetooth-serial';

type getDevicesArg = (isEnabled: boolean, devices: []) => void;

export default class BluetoothSerialModule{

  getDevices = (callback: getDevicesArg) => {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values;
      if (callback) {
        callback( isEnabled, devices);
      }
    })
  }

  getBLStatus = (bluetoothEnabledHandler, bluetoothDisabledHandler) => {
    BluetoothSerial.on('bluetoothEnabled', () => {
      this.getDevices(bluetoothEnabledHandler);
      BluetoothSerial.on('bluetoothDisabled', bluetoothDisabledHandler);
      BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`));
    })
  }

  connect (device, conectHandler, readDataHandler) {
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`);
      ToastAndroid.show(`Connected to device ${device.name}`, ToastAndroid.SHORT);
      if(conectHandler) {
        conectHandler(res)
      }
      BluetoothSerial.withDelimiter('\r\n').then(() => {
        BluetoothSerial.on('read', data => {
          if(readData) {
            readData(data);
          }
          console.log(`DATA FROM BLUETOOTH: ${data.data}`);
        });
      });
    })
    .catch((err) => console.log((err.message)))
  }

  enable() {
    return BluetoothSerial.enable();
  }

  disable() {
    return BluetoothSerial.disable();
  }

  discoverUnpairedDevices(callback) {
    BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        console.log(3);
        console.log(unpairedDevices);
        const uniqueDevices = unpairedDevices.reduce((a, unpairedDevice) => ({
          ...a,
          [unpairedDevice.id]: unpairedDevice,
        }), {});
        if(callback) {
          callback(uniqueDevices);
        }
      })
      .catch((err) => console.log(err.message))
  }

  sendData = (code: number, callback: Function) => {
    BluetoothSerial.write(code)
    .then((res) => {
      console.log('Successfuly wrote to device', code, res);
      callback();
    })
    .catch((err) => console.log(err.message))
  }
}
