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
import {
  SET_SEGMENT_A,
  SET_SEGMENT_B,
  SET_SEGMENT_C,
  SET_SEGMENT_D,
  SET_SEGMENT_E,
  SET_SEGMENT_F,
  SET_SEGMENT_G,
} from './app.const.js';
import BluetoothSerialModule from './bluetoothSerialModule.js';
import type { getDevicesArg } from './bluetoothSerialModule.js';

type State = {
  isEnabled: boolean,
  discovering: boolean,
  devices: [],
  unpairedDevices: {},
  connected: boolean,
  text: string,
  device: {},
  elements: {
    a: boolean,
    b: boolean,
    c: boolean,
    d: boolean,
    f: boolean,
    e: boolean,
    f: boolean,
    g: boolean,
  },
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
      element: {
        a: false,
        b: false,
        c: false,
        d: false,
        f: false,
        e: false,
        f: false,
        g: false,
      },
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

  getElementState(segment) {
    const element = this.state;
    switch (segment) {
      case SET_SEGMENT_A: element.a = !element.a; break;
      case SET_SEGMENT_B: element.b = !element.b; break;
      case SET_SEGMENT_C: element.c = !element.c; break;
      case SET_SEGMENT_D: element.d = !element.d; break;
      case SET_SEGMENT_E: element.e = !element.e; break;
      case SET_SEGMENT_F: element.f = !element.f; break;
      case SET_SEGMENT_G: element.g = !element.g; break;
    }

    return element
  }

  onPressSegment = (segment) => {
     console.log("segment", segment);
     this.BS.sendData(segment, () => {
      const element = this.getElementState(segment);
      this.setState({ element });
      // this.setState({ connected: true })
    });
  }

  toggleSwitch = () => {}

  render() {
    console.log(this.state);
    const { element } = this.state;

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
        <Text style={styles.text}>{this.state.text}</Text>
        <Text style={styles.text}>{JSON.stringify(this.state.device)}</Text>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'powderblue'}}>
            <View style={{flex: 1, backgroundColor: 'grey'}} />
            <TouchableOpacity
              style={{flex: 2, backgroundColor: element.a ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_A)}}
            />
            <View style={{flex: 1, backgroundColor: 'grey'}} />
          </View>
          <View style={{flex: 2, flexDirection: 'row', backgroundColor: 'skyblue'}} >
            <TouchableOpacity
              style={{flex: 1, backgroundColor: element.f ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_F)}}
            />
            <View style={{flex: 2, backgroundColor: 'grey'}} />
            <TouchableOpacity
              style={{flex: 1, backgroundColor: element.b ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_B)}}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'steelblue'}} >
            <View style={{flex: 1, backgroundColor: 'grey'}} />
            <TouchableOpacity
              style={{flex: 2, backgroundColor: element.g ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_G)}}
            />
            <View style={{flex: 1, backgroundColor: 'grey'}} />
          </View>
          <View style={{flex: 2, flexDirection: 'row', backgroundColor: 'skyblue'}} >
            <TouchableOpacity
              style={{flex: 1, backgroundColor: element.e ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_E)}}
            />
            <View style={{flex: 2, backgroundColor: 'grey'}} />
            <TouchableOpacity
              style={{flex: 1, backgroundColor: element.c ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_C)}}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'steelblue'}} >
            <View style={{flex: 1, backgroundColor: 'grey'}} />
            <TouchableOpacity
              style={{flex: 2, backgroundColor: element.d ? 'green' : 'red'}}
              onPress={() => {this.onPressSegment(SET_SEGMENT_D)}}
            />
            <View style={{flex: 1, backgroundColor: 'grey'}} />
          </View>
        </View>
      </View>
    );
  }
}
