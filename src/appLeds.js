// @flow
import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  Button,
  FlatList,
  Switch,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial'
import styles from './app.style.js';
import {
  SET_LED_0
  SET_LED_1
  SET_LED_2
} from './app.const.js';

type State = {
  isEnabled: boolean,
  discovering: boolean,
  devices: [],
  unpairedDevices: {},
  connected: boolean,
  text: string,
  device: {},
}

export default class App extends Component<{}, State> {
  constructor (props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: {},
      connected: false,
      text: '',
      device: {},
    }
  }
  componentWillMount(){

    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values

      this.setState({ isEnabled, devices })
    })

    BluetoothSerial.on('bluetoothEnabled', () => {

      Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ])
      .then((values) => {
        const [ isEnabled, devices ] = values
        this.setState({  devices })
      })

      BluetoothSerial.on('bluetoothDisabled', () => {
         this.setState({ devices: [] })
      })
      BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))

    })

  }
  connect (device) {
    this.setState({ connecting: true })
    this.setState({device});
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`);

      ToastAndroid.show(`Connected to device ${device.name}`, ToastAndroid.SHORT);

      BluetoothSerial.withDelimiter('\r\n').then(() => {
        BluetoothSerial.on('read', data => {
          if(data&&data.data) {
            this.setState({text: JSON.stringify(data)});
          }
          console.log(`DATA FROM BLUETOOTH: ${data.data}`);
        });
      });
    })
    .catch((err) => console.log((err.message)))
  }

  enable () {
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  disable () {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  toggleBluetooth (value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }
  discoverAvailableDevices () {
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        console.log(3);
        console.log(unpairedDevices);
        const uniqueDevices = unpairedDevices.reduce((a, unpairedDevice) => ({
          ...a,
          [unpairedDevice.id]: unpairedDevice,
        }), {});
        console.log(uniqueDevices);
        this.setState({ unpairedDevices: uniqueDevices, discovering: false })
      })
      .catch((err) => console.log(err.message))
    }
  }
  toggleSwitch = () => {

  }

  sendData = (code: number, callback: Function) => {
    BluetoothSerial.write(code)
    .then((res) => {
      console.log('Successfuly wrote to device', code, res);
      if (callback) {
        callback();
      }
    })
    .catch((err) => console.log(err.message))
  }

  getTemperature = () => {
    this.sendData(GET_TEMPEPATURE, () => {
      this.setState({ connected: true })
    });
  }

  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
      <View style={styles.toolbar}>
            <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>
            <View style={styles.toolbarButton}>
              <Switch
                value={this.state.isEnabled}
                onValueChange={(val) => this.toggleBluetooth(val)}
              />
            </View>
      </View>
        <Button
          onPress={this.discoverAvailableDevices.bind(this)}
          title="Scan for Devices"
          color="#841584"
        />
        <FlatList
          style={{flex:1}}
          data={this.state.devices}
          keyExtractor={item => item.id}
          renderItem={(item) => (
            <TouchableOpacity onPress={() => this.connect(item.item)}>
              <View style={styles.deviceNameWrap}>
                <Text style={styles.deviceName}>{ item.item.name ? item.item.name : item.item.id }</Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <Button
          onPress={this.toggleSwitch.bind(this)}
          title="Switch(On/Off)"
          color="#841584"
        />
        <Button
          onPress={this.toggleSwitch.bind(this)}
          title="LED 0"
          color="#841584"
        />
        <Button
          onPress={this.toggleSwitch.bind(this)}
          title="LED 1"
          color="#841584"
        />
        <Button
          onPress={this.toggleSwitch.bind(this)}
          title="LED 2"
          color="#841584"
        />
        <Text style={styles.text}>{this.state.text}</Text>
        <Text style={styles.text}>{JSON.stringify(this.state.device)}</Text>
      </View>
    );
  }
}
