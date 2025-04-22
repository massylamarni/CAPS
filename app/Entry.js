import React, { Component, useEffect } from 'react';
import {Alert, SafeAreaView, StyleSheet, View, ScrollView, Text, TouchableOpacity} from 'react-native';
import {NativeEventEmitter, NativeModules, Platform, PermissionsAndroid} from 'react-native';

import update from 'immutability-helper';
import UUIDGenerator from 'react-native-uuid-generator';
import { Buffer } from 'buffer';

import BleManager, { BleState, Peripheral }  from 'react-native-ble-manager';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { startAdvertising, stopAdvertising, addService, addCharacteristicToService, removeAllServices, sendNotificationToDevice} from 'react-native-bluetooth-client';
import * as BLEPeripheral from 'react-native-bluetooth-client';

import SensorScreen from './SensorScreen';


// Central connection
const MAX_CONNECT_WAITING_PERIOD = 30000;
let connectedDeviceId = "";
const serviceReadinIdentifier = "00001234-0000-1000-8000-00805f9b34fb";
const charNotificationIdentifier = "00005678-0000-1000-8000-00805f9b34fb";
const SERVICE = "1234";
const CHARACTERISTIC = "5678";

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

// Peripheral
const BluetoothClientEmitter = new NativeEventEmitter(NativeModules.BluetoothClient);
BluetoothClientEmitter.addListener('onReceiveData', onReceiveData);

const onReceiveData = (event) => {
  console.log(event);
};

const ADVERTISE_TIME = 3 * 60 * 1000;
const NOTIFY_TIME = 3000;
const PERIPHERAL_NAME = "GALAXY";

export async function requestPermissions() {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ],
      );
      const allGranted = Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );
      if (allGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[Permissions]', 'Permissions granted');
      } else {
        console.log('[Permissions]', 'Permissions denied');
      }
    }

    BLEPeripheral.enableBluetooth();
  } catch (err) {
    console.warn(err);
  }
}

export const isDeviceConnected = async (deviceId) => {
    return await BleManager.isPeripheralConnected(deviceId, []);
};

export const safelyConnect = async (deviceId) => {
  // Remove the explicit Promise constructor - since you're using async/await
  let failedToConnectTimer;

  try {
    //before connecting, ensure if app is already connected to device or not.
    let isConnected = await isDeviceConnected(deviceId);

    if (!isConnected) {
      //if not connected already, set the timer such that after some time connection process automatically stops if its failed to connect.
      failedToConnectTimer = setTimeout(() => {
        throw new Error('Connection timeout');
      }, MAX_CONNECT_WAITING_PERIOD);

      await BleManager.connect(deviceId);
      clearTimeout(failedToConnectTimer);
      isConnected = await isDeviceConnected(deviceId);
    }

    if (!isConnected) {
      return false;
    }

    //Connection success
    connectedDeviceId = deviceId;

    //get the services and characteristics information for the connected hardware device.
    const peripheralInformation = await BleManager.retrieveServices(deviceId);
    console.log(peripheralInformation);

    
    // Check for supported services and characteristics from device info
    
    const deviceSupportedServices = (peripheralInformation.services || []).map(item => item?.uuid?.toUpperCase());
    const deviceSupportedCharacteristics = (peripheralInformation.characteristics || []).map(_char => _char.characteristic.toUpperCase());
    console.log(deviceSupportedCharacteristics);
    console.log(deviceSupportedServices);
    
    if (!deviceSupportedServices.includes(SERVICE) || !deviceSupportedCharacteristics.includes(CHARACTERISTIC)) { 
      //if required service ID and Char ID is not supported by hardware, close the connection.
      await BleManager.disconnect(connectedDeviceId);
      throw new Error('Connected device does not have required service and characteristic.');
    }

    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      // Success code
      console.log(peripheralsArray);
    });

    BleManager.createBond(deviceId)
      .then(() => {
        console.log("createBond success or there is already an existing one");
      })
      .catch(() => {
        console.log("fail to bond");
      });

    BleManager.getBondedPeripherals([]).then((bondedPeripheralsArray) => {
      // Each peripheral in returned array will have id and name properties
      console.log(bondedPeripheralsArray);
    });
    
    BleManager.read(deviceId, SERVICE, CHARACTERISTIC)
      .then((readData) => {
        // Success code
        console.log("Read: " + readData);
        const buffer = Buffer.from(readData);
        const sensorData = buffer.readUInt8(1, true);
        console.log("Buffer: " + sensorData);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
    
    BleManager.startNotification(deviceId, SERVICE, CHARACTERISTIC)
      .then(() => {
        // Success code
        console.log("Notification started");
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });

    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', async () => {
      //add the code to execute after hardware disconnects.
      if (connectedDeviceId){
        await BleManager.disconnect(connectedDeviceId);
      }
    });

    return true;
  } catch (err) {
    if (failedToConnectTimer) {
      clearTimeout(failedToConnectTimer);
    }
    if (connectedDeviceId) {
      await BleManager.disconnect(connectedDeviceId).catch(() => {});
    }
    console.error("Connection error:", err);
    // throw err; // Re-throw the error so it can be caught by the caller
  }
};

export function addListener(peripheral, service, characteristic) {
  return new Promise(async(resolve, reject) => {
    let timeOutId;
    const listener = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", ({ value_l, peripheral_l, characteristic_l, service_l }) => {
      clearTimeout(timeOutId);
      if (value_l.length !== 20) {
        /**
          * value is less than 20 bytes. Because more than 20 bytes not possible at once.
          * Either first chunk itself have less than 20 bytes data
          * or we have less than 20 bytes data at next chunks.
        */
        // Convert bytes array to string
        const data = Buffer.from(value_l).toString('utf8');
        console.log(`Received ${data} for characteristic ${characteristic_l}`);
        resolve(data);
      } else {
        //value is of exactly 20 bytes, schedule to resolve after 2 sec.
        //because we may recieve more data than 20 bytes
        //Convert bytes array to string
        const data = Buffer.from(value_l).toString('utf8');
        console.log(`Received ${data} for characteristic ${characteristic_l}`);
        timeOutId = setTimeout(() => {
          resolve(data);
        }, 2500);
      }
    });
  });
};


class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: '',
      isAdvertising: false,
      isScanning: false,
      devicesFound: [],
    };
  }

  addDevice(_advFlags, _deviceAddress, _deviceName, _rssi, _serviceUuids, _txPower, _date) {
    const index = this.state.devicesFound.findIndex(({deviceAddress}) => deviceAddress === _deviceAddress);
    if (index < 0) {
      this.setState({
        devicesFound: update(this.state.devicesFound, {
          $push: [
            {
              advFlags: _advFlags,
              deviceName: _deviceName,
              deviceAddress: _deviceAddress,
              rssi: _rssi,
              serviceUuids: _serviceUuids,
              txPower: _txPower,
              start: _date,
              end: _date,
            },
          ],
        }),
      });
    } else {
      this.setState({
        devicesFound: update(this.state.devicesFound, {
          [index]: {
            end: {$set: _date},
            rssi: {$set: _rssi || this.state.devicesFound[index].rssi},
          },
        }),
      });
    }
  }

  componentDidMount() {
    requestPermissions();
    UUIDGenerator.getRandomUUID((newUid) => {
      this.setState({
        uuid: newUid.slice(0, -2) + '00',
      });
    });
  }

  componentWillUnmount() {
    if (this.state.isAdvertising) {
      this.stopAdvertising();
    }
    if (this.state.isScanning) {
      this.stopScanning();
    }
  }

  keepAdvertisng() {
    this.advertiseInterval = setInterval(() => {
      BLEPeripheral.startAdvertising(0);
    }, ADVERTISE_TIME);
  }

  startNotifying() {
    this.notifyInterval = setInterval(() => {
      BLEPeripheral.sendNotificationToDevice(
        serviceReadinIdentifier,
        charNotificationIdentifier,
        'hi'
      )
        .then((e) => console.log("Notified"))
        .catch((e) => console.log(e));
    }, NOTIFY_TIME);
    
  }

  startAdvertising() {
    console.log(this.state.uuid, 'Starting Advertising');
    BLEPeripheral.setName(PERIPHERAL_NAME);

    BLEPeripheral.addService(serviceReadinIdentifier, true);
    BLEPeripheral.addCharacteristicToService(
      serviceReadinIdentifier,
      charNotificationIdentifier,
      1 | 16,
      1 | 2 | 8 | 16 | 32,
      'Value'
    );

    BLEPeripheral.startAdvertising(0)
      .then((sucess) => console.log(this.state.uuid, 'Adv Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Adv Error', error));

    this.keepAdvertisng();
    this.startNotifying();

    this.setState({
      isAdvertising: true,
    });
  }

  stopAdvertising() {
    console.log(this.state.uuid, 'Stopping advertising');
    BLEPeripheral.stopAdvertising()
      .then((sucess) => console.log(this.state.uuid, 'Stop advertising Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Stop advertising Error', error));

    clearInterval(this.advertiseInterval);
    clearInterval(this.notifyInterval);
    BLEPeripheral.removeAllServices()
      .then((e) => console.log("All services removed"))
      .catch((e) => console.log(e));

    this.setState({
      isAdvertising: false,
    });
  }

  startScanning() {
    console.log(this.state.uuid, 'Registering Listener');
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    this.onDeviceFound = eventEmitter.addListener('onDeviceFound', (event) => {
      //console.log('onDeviceFound', event);
      this.addDevice(
        event.advFlags,
        event.deviceAddress,
        event.deviceName,
        event.rssi,
        event.serviceUuids,
        event.txPower,
        new Date(),
      );        
    });

    console.log(this.state.uuid, 'Starting Scanner');
    BLEAdvertiser.scan(null, {
      scanMode: BLEAdvertiser.SCAN_MODE_LOW_POWER,
    })
      .then((sucess) => console.log(this.state.uuid, 'Scan Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Scan Error', error));

    this.setState({
      isScanning: true,
    });
  }

  stopScanning() {
    console.log(this.state.uuid, 'Removing Listener');
    this.onDeviceFound.remove();
    delete this.onDeviceFound;

    console.log(this.state.uuid, 'Stopping Scanning');
    BLEAdvertiser.stopScan()
      .then((sucess) => console.log(this.state.uuid, 'Stop Scan Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Stop Scan Error', error));

    this.setState({
      isScanning: false,
    });
  }

  connect(addr) {
    const connectionResponse = safelyConnect(addr);
    console.log(connectionResponse);
  }

  short(str) {
    if (!str || str.length < 8) return str ?? 'unknown';
    return (
      str.substring(0, 4) +
      ' ... ' +
      str.substring(str.length - 4, str.length)
    ).toUpperCase();
  }

  render() {
    return (
      <SafeAreaView style={styles.body}>
        <ScrollView>
          <View style={styles.bleSection}>
            <View style={styles.sectionContainer}>
              <Text style={styles.masterTitle}>BLE Advertiser Demo</Text>
            </View>

            <View style={styles.horizontalButtonContainer}>
              {!this.state.isAdvertising ? (
                <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={() => this.startAdvertising()}>
                  <Text style={styles.defaultButtonText}>Start Advertising</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.defaultButton, styles.notLastButton, styles.activeStateButton]} onPress={() => this.stopAdvertising()}>
                  <Text style={styles.defaultButtonText}>Stop Advertising</Text>
                </TouchableOpacity>
              )}
              {!this.state.isScanning ? (
                <TouchableOpacity style={styles.defaultButton} onPress={() => this.startScanning()}>
                  <Text style={styles.defaultButtonText}>Start Scanning</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.defaultButton, styles.activeStateButton]} onPress={() => this.stopScanning()}>
                  <Text style={styles.defaultButtonText}>Stop Scanning</Text>
                </TouchableOpacity>
              )}
            </View>

            <View>
            {this.state.isAdvertising ? (
              <Text style={styles.sectionDescription}>Advertising:{' '}
                <Text style={styles.highlight}>{this.state.uuid}</Text>
              </Text>
            ) : (
              <Text style={styles.sectionDescription}>Advertising is{' '}
                <Text style={styles.highlight}>off</Text>
              </Text>
            )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Devices Scanned</Text>
              {this.state.devicesFound.length !== 0 ? (
                this.state.devicesFound.map((item) => {
                  const isConnectible = item.serviceUuids.length === 0 ? false : true;
                  return (
                    <View key={item.deviceAddress} style={styles.deviceInfoContainer}>
                      <Text style={styles.deviceInfo}>
                        {this.short(item.serviceUuids[0])} {item.deviceAddress} {item.rssi}
                      </Text>
                      <TouchableOpacity style={[styles.defaultLinkContainer]} onPress={() => {isConnectible ? this.connect(item.deviceAddress) : null}}>
                        <Text style={isConnectible ? styles.listActionLink : styles.listActionLinkGreyed}>{isConnectible ? 'Connect' : 'Not connectible'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                this.state.isScanning ? (
                  <Text style={styles.sectionDescription}>Scanning...</Text>
                ) : (
                  <Text style={styles.sectionDescription}>No devices found</Text>
                )
              )}
              {this.state.devicesFound.length !== 0 && (
                <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.setState({devicesFound: []})}>
                  <Text style={styles.defaultLink}>Clear Devices</Text>
                </TouchableOpacity>)}
            </View>
          </View>
          <View style={styles.sensorSection}>
            <SensorScreen />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
  },
  bleSection: {
  },
  sensorSection: {
  },
  sectionContainer: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  masterTitle: {
    fontSize: 22,
    marginBottom: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  defaultButton: {
    borderRadius: 5,
    backgroundColor: '#303030',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  defaultButtonText: {
    fontSize: 10,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  defaultLinkContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  defaultLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
    color: '#505050',
  },
  listActionLink: {
    fontSize: 10,
    textDecorationLine: 'underline',
    color: '#50a050',
  },
  listActionLinkGreyed: {
    fontSize: 10,
    color: '#303030',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
  },
  deviceInfo: {
    padding: 3,
    fontSize: 10,
    fontWeight: '400',
  },
  notLastButton: {
    marginRight: 15,
  },
  activeStateButton: {
    backgroundColor: '#808080',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Entry;
