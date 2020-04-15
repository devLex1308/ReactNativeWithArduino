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

import styles from './app.style.js';
import { GET_TEMPEPATURE } from './app.const.js';
import BluetoothSerialModule from './bluetoothSerialModule.js';
import type { getDevicesArg } from './bluetoothSerialModule.js';
import Jostic from './jostick.js'

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
    this.BS = new BluetoothSerialModule();
  }

  getDevices: getDevicesArg;
  getDevices = (isEnabled, devices) => { this.setState({ isEnabled, devices }) }

  componentDidMount() {
    this.BS.getDevices(this.getDevices);
    this.BS.getBLStatus(
      this.getDevices,
      () => { this.setState({ devices: [] }); }
    );
  }

  conectHandler = (res) => {
    this.timer = setInterval(() => {
      this.getTemperature();
    }, 2000);
  }

  readDataHandler = (data) => {
    if(data&&data.data) {
      this.setState({text: JSON.stringify(data)});
    }
  }

  connect (device) {
    this.setState({ connecting: true })
    this.setState({device});
    this.BS.connect(device, this.conectHandler, this.readDataHandler);
  }

  componentWillUnmount() {
    if (this.timer ){
      clearInterval(this.timer);
    }
  }

  enable () {
    this.BS.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  disable () {
    this.BS.disable()
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
      this.BS.discoverUnpairedDevices((unpairedDevices) => {
        this.setState({ unpairedDevices, discovering: false })
      });
    }
  }

  toggleSwitch = () => {

  }

  getTemperature = () => {
    this.BS.sendData(GET_TEMPEPATURE, () => {
      this.setState({ connected: true })
    });
  }

  jostickListener = pos=>{
    const {x, y} = pos;
    const xr = Math.round(100*x);
    const yr = Math.round(100*y);
    console.log('pos', {xr, yr});
     this.BS.sendData('$'+xr+' '+yr+';', () => {
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
        {/* <Button */}
        {/*   onPress={this.toggleSwitch.bind(this)} */}
        {/*   title="Switch(On/Off)" */}
        {/*   color="#841584" */}
        {/* /> */}
        {/* <Text style={styles.text}>{this.state.text}</Text> */}
        {/* <Text style={styles.text}>{JSON.stringify(this.state.device)}</Text> */}
        <Jostic style={{borderWidth:1}} setPosition={this.jostickListener}/>
      </View>
    );
  }
}
