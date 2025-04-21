import React, {Component} from 'react';

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';

import {NativeEventEmitter, NativeModules} from 'react-native';

import update from 'immutability-helper';
import BLEAdvertiser from 'react-native-ble-advertiser';
import BleManager, { BleState, Peripheral }  from 'react-native-ble-manager';
import UUIDGenerator from 'react-native-uuid-generator';
import {PermissionsAndroid} from 'react-native';
import { Buffer } from 'buffer';
import SensorScreen from './SensorScreen';


// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];
// No scanner filters (finds all devices inc iPhone). Use UUID suffix to filter scans if using.
const SCAN_MANUF_DATA = Platform.OS === 'android' ? null : MANUF_DATA;

BLEAdvertiser.setCompanyId(APPLE_ID);

const MAX_CONNECT_WAITING_PERIOD = 30000;
let connectedDeviceId = "";
const serviceReadinIdentifier = "D0611E78-BBB4-4591-A5F8-487910AE4366";
const charNotificationIdentifier = "8667556C-9A37-4C91-84ED-54EE27D90049";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export async function requestLocationPermission() {
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

    const askBluetooth = async () => {
      await Alert.alert(
        'Example requires bluetooth to be enabled',
        'Would you like to enable Bluetooth?',
        [
          {
            text: 'Yes',
            onPress: () => BLEAdvertiser.enableAdapter(),
          },
          {
            text: 'No',
            onPress: () => console.log('Do Not Enable Bluetooth Pressed'),
            style: 'cancel',
          },
        ],
      );
    }

    const blueoothActive = await BLEAdvertiser.getAdapterState()
      .then((result) => {
        console.log('[Bluetooth]', 'Bluetooth Status', result);
        return result === 'STATE_ON';
      })
      .catch((error) => {
        console.log('[Bluetooth]', 'Bluetooth Not Enabled');
        return false;
      });

      if (!blueoothActive) askBluetooth();
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
    
    if (!deviceSupportedServices.includes(serviceReadinIdentifier) || !deviceSupportedCharacteristics.includes(charNotificationIdentifier)) { 
      //if required service ID and Char ID is not supported by hardware, close the connection.
      await BleManager.disconnect(connectedDeviceId);
      throw new Error('Connected device does not have required service and characteristic.');
    }
    

    await BleManager.startNotification(deviceId, serviceReadinIdentifier, charNotificationIdentifier);
    console.log('Started notification successfully on ', charNotificationIdentifier);

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
    requestLocationPermission();
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

  startAdvertising() {
    console.log(this.state.uuid, 'Starting Advertising');
    BLEAdvertiser.broadcast(this.state.uuid, MANUF_DATA, {
      advertiseMode: BLEAdvertiser.ADVERTISE_MODE_BALANCED,
      txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
      connectable: true,
      includeDeviceName: false,
      includeTxPowerLevel: true,
    })
      .then((sucess) => console.log(this.state.uuid, 'Adv Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Adv Error', error));

    this.setState({
      isAdvertising: true,
    });
  }

  startScanning() {
    console.log(this.state.uuid, 'Registering Listener');
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    console.log('BLEAdvertiser Native Module:', NativeModules.BLEAdvertiser);


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
    BLEAdvertiser.scan(SCAN_MANUF_DATA, {
      scanMode: BLEAdvertiser.SCAN_MODE_LOW_POWER,
    })
      .then((sucess) => console.log(this.state.uuid, 'Scan Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Scan Error', error));

    this.setState({
      isScanning: true,
    });
  }

  stopAdvertising() {
    console.log(this.state.uuid, 'Stopping Broadcast');
    BLEAdvertiser.stopBroadcast()
      .then((sucess) => console.log(this.state.uuid, 'Stop Broadcast Successful', sucess))
      .catch((error) => console.log(this.state.uuid, 'Stop Broadcast Error', error));

    this.setState({
      isAdvertising: false,
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
