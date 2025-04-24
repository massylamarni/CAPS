import React from 'react';
import { PermissionsAndroid, ToastAndroid, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from "react-native-bluetooth-classic";
import SensorScreen from './sensorScreen';

type BluetoothEventSubscription = /*unresolved*/ any
type StateChangeEvent = /*unresolved*/ any
type BluetoothDeviceEvent = /*unresolved*/ any
type BluetoothReadEvent = /*unresolved*/ any

class BlueComponent extends React.Component {
  state: {
    allGranted: boolean,
    enabled: boolean,
    connectionStatus: boolean,
    discovering: boolean,
    scanning: boolean,
    pairing: boolean,
    connecting: boolean,
    accepting: boolean,
    bonded: BluetoothDevice[],
    connectedDevices: BluetoothDevice[],
    device: BluetoothDevice | null,
    data: {},
    unpaired: BluetoothDevice[],
  } = {
    allGranted: false,
    enabled: false,
    connectionStatus: false,
    discovering: false,
    scanning: false,
    pairing: false,
    connecting: false,
    accepting: false,
    bonded: [] as BluetoothDevice[],
    connectedDevices: [] as BluetoothDevice[],
    device: null,
    data: {},
    unpaired: [] as BluetoothDevice[],
  };

  onBluetoothEnabledSub: BluetoothEventSubscription;
  onBluetoothDisabledSub: BluetoothEventSubscription;
  onDeviceConnectedSub: BluetoothEventSubscription;
  onDeviceDisconnectedSub: BluetoothEventSubscription;
  onBluetoothErrorSub: BluetoothEventSubscription;
  onReceivedDataSub: BluetoothEventSubscription;
  scanInterval!: NodeJS.Timeout;
  checkConnectionsInterval!: NodeJS.Timeout;

  async componentDidMount () {
    await this.initBluetooth();
    await this.initListeres();
    await this.checkConnections();
  }

  componetWillUnmount() {    
    this.onBluetoothDisabledSub.remove();
    this.onBluetoothEnabledSub.remove();
    this.onDeviceConnectedSub.remove();
    this.onDeviceDisconnectedSub.remove();
    this.onBluetoothErrorSub.remove();
    this.onReceivedDataSub.remove();
    clearInterval(this.scanInterval);
    clearInterval(this.checkConnectionsInterval);
  }

  async initListeres() {
    const onBluetoothEnabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth enabled`, ToastAndroid.SHORT);
      this.setState({ enabled: event.enabled });
    }
    const onBluetoothDisabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth disabled`, ToastAndroid.SHORT);
      this.setState({ enabled: !event.enabled });
    }
    const onDeviceConnected = (event: BluetoothDeviceEvent) => {
      ToastAndroid.show(`Device connected`, ToastAndroid.SHORT);
      this.setState({ device: event.device });
    }
    const onDeviceDisconnected = (event: BluetoothDeviceEvent) => {
      ToastAndroid.show(`Device disconnected`, ToastAndroid.SHORT);
      this.setState({ device: event.device });
    }
    const onBluetoothError = (event: BluetoothDeviceEvent) => {
      if (event.device) {
        ToastAndroid.show(`Device error`, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(`Adapter related error`, ToastAndroid.SHORT);
      }
    }

    this.onBluetoothEnabledSub = RNBluetoothClassic.onBluetoothEnabled(onBluetoothEnabled);
    this.onBluetoothDisabledSub = RNBluetoothClassic.onBluetoothDisabled(onBluetoothDisabled);
    this.onDeviceConnectedSub = RNBluetoothClassic.onDeviceConnected(onDeviceConnected);
    this.onDeviceDisconnectedSub = RNBluetoothClassic.onDeviceDisconnected(onDeviceDisconnected);
    this.onBluetoothErrorSub = RNBluetoothClassic.onError(onBluetoothError);
  }

  receptionListener() {
    console.log("Reception Listener added on device: ");
    console.log(this.state.device);
    const onReceivedData = (event: BluetoothReadEvent) => {
      console.log("Message received");
      this.setState({data: {
        ...event,
        timestamp: new Date(),  // Add the current date
        type: 'receive'         // Add a type for UI
      }}, () => {
        console.log(this.state.data);
      });
    }

    this.onReceivedDataSub = this.state.device?.onDataReceived((data) => onReceivedData(data));
  }

  async initBluetooth() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const allGranted = Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
      this.setState({ allGranted: allGranted });
    } catch (err) {
      ToastAndroid.show(`Failed to set permissions: ${err}`, ToastAndroid.SHORT);
    };

    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      this.setState({ enabled: enabled });
    } catch (err) {
      ToastAndroid.show(`Failed to get Bluetooth status: ${err}`, ToastAndroid.SHORT);
    }
  }

  async getConnectedDevices() {
    try {
      const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
      if (connectedDevices.length !== 0) {
        this.setState({ connectedDevices: connectedDevices, device: connectedDevices[0], connectionStatus: true }, () => {
          this.receptionListener();
        });
      }
    } catch (err) {
      ToastAndroid.show(`Failed to get connected devices: ${err}`, ToastAndroid.SHORT);
    }
  }

  async checkConnections() {
    this.checkConnectionsInterval = setInterval(async () => {
      if (!this.state.connectionStatus) {
        this.getConnectedDevices();
      }
    }, 1000);
  }

  async startScan() {
    if (this.state.scanning == false) {
      this.scanInterval = setInterval(async () => {
        // Get bonded devices
        try {
          this.setState({ scanning: true });
          const bonded = await RNBluetoothClassic.getBondedDevices();
          this.setState({ scanning: true, bonded: bonded });
        } catch (err) {
          this.setState({ scanning: false });
          ToastAndroid.show(`Failed to get bonded devices: ${err}`, ToastAndroid.SHORT);
        }
      }, 1000);
    }
  }

  async stopScan() {
    clearInterval(this.scanInterval);
    this.setState({ scanning: false });
  }

  async startDiscovery() {
    try {  
      this.setState({ discovering: true });
  
      try {
        const unpaired = await RNBluetoothClassic.startDiscovery();   
        this.setState({ unpaired });
        ToastAndroid.show(`Found ${unpaired.length} unpaired devices.`, ToastAndroid.SHORT);
      } finally {
        this.setState({ discovering: false });
      }
    } catch (err: any) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  }

  async cancelDiscovery() {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      if (cancelled) this.setState({ discovering: false });
    } catch(error) {
      ToastAndroid.show(`Error occurred while attempting to cancel discover devices`, ToastAndroid.SHORT);
    }
  }

  async pairDevice(deviceAddr: string) {
    try {
      this.setState({ pairing: true });
      try {
        const device = await RNBluetoothClassic.pairDevice(deviceAddr);
        this.setState({ device: device });
      } finally {
        this.setState({ pairing: false });
      }
    } catch(error) {
      ToastAndroid.show(`Error occurred while attempting to pair to device`, ToastAndroid.SHORT);
    }
  }

  async unpairDevice(deviceAddr: string) {
    try {
      const device = await RNBluetoothClassic.unpairDevice(deviceAddr);
      this.setState({ device });
    } catch(error) {
      ToastAndroid.show(`Error occurred while attempting to unpair the device`, ToastAndroid.SHORT);
    }
  }

  async acceptConnections() {
    this.setState({ accepting: true });
      
    try {      
      const device = await RNBluetoothClassic.accept({});
      this.setState({ device });
    } catch (error) {
      ToastAndroid.show(`Error occurred while attempting to enter accept mode`, ToastAndroid.SHORT);
    } finally {
      this.setState({ accepting: false });
    }
  }

  async cancelAcceptConnections() {
    if (!this.state.accepting) {
      return;
    }

    try {
      await RNBluetoothClassic.cancelAccept();
      this.setState({ isAccepting: false });
    } catch(error) {
      ToastAndroid.show(`Error occurred while attempting to exit accept mode`, ToastAndroid.SHORT);
    }
  }

  async connect(_device: BluetoothDevice | null) {
    try {
      this.setState({ connecting: true });
      try {
        const device = this.state.device ? this.state.device : _device;
        let connectionStatus = await device?.isConnected();
        if (!connectionStatus) {
          connectionStatus = await device?.connect();
        }
        
        this.setState({ connectedDevices: [device], device: device, connectionStatus: true }, () => {
          this.receptionListener();
        });
        // this.initializeRead();
      } finally {
        this.setState({ connecting: false });
      }
    } catch (error) {
      // Handle error accordingly
    }
  }

  async disconnect() {
    try {
      const disconnected = await this.state.device?.disconnect();
      this.setState({connectionStatus: !disconnected});
    } catch(error) {
      // Handle error accordingly
    }
  }

  async available() {
    try {
      const messages = await this.state.device?.available();
      console.log(messages);
    } catch (error) {
      // Handle accordingly
    }
  }

  async read() {
    try {
      const message = await this.state.device?.read();
      this.setState({ data: message });
      console.log("read");
      console.log(this.state.device);
      console.log(message);
    } catch (error) {
      // Handle error accordingly
    }
  }

  async write(message: string) {
    try {
      const writeStatus = await this.state.device?.write(message);
      if (writeStatus) console.log("Write success");
    } catch (error) {
      // Handle error accordingly
    }
  }
 
  render() {
    return(
      <>
        <ThemedView>
          <ThemedText style={styles.masterTitle}>Bluetooth data transfer</ThemedText>
        </ThemedView>
        <ThemedView style={styles.horizontalButtonContainer}>
          {!this.state.discovering ? (
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={async () => await this.startDiscovery()}>
            <ThemedText style={styles.defaultButtonText}>Start Discovery</ThemedText>
          </TouchableOpacity>
          ) : (
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton, styles.activeStateButton]} onPress={async () => await this.cancelDiscovery()}>
            <ThemedText style={styles.defaultButtonText}>Stop Discovery</ThemedText>
          </TouchableOpacity>
          )}
          
          {!this.state.scanning ? (
          <TouchableOpacity style={styles.defaultButton} onPress={async () => await this.startScan()}>
            <ThemedText style={styles.defaultButtonText}>Start Scan</ThemedText>
          </TouchableOpacity>
          ) : (
          <TouchableOpacity style={[styles.defaultButton, styles.activeStateButton]} onPress={async () => await this.stopScan()}>
            <ThemedText style={styles.defaultButtonText}>Stop Scan</ThemedText>
          </TouchableOpacity>
          )}
        </ThemedView>
        
        
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>Unpaired devices</ThemedText>
          {this.state.unpaired.length === 0 ? (
            <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
          ) : (
            this.state.unpaired.map((device, index) => (
              <ThemedView key={index} style={styles.deviceInfoContainer}>
                <ThemedText>
                  {device.name} {device.address}
                </ThemedText>
                <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.state.pairing ? null : this.pairDevice(device.address)}>
                  <ThemedText style={[this.state.pairing ? styles.listActionLinkGreyed : styles.listActionLink, styles.notLastButton]}>{this.state.pairing ? 'Pairing' : 'Pair'}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              ))
          )}
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>Paired devices</ThemedText>
          {!this.state.device ? (
            <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
          ) : (
            <ThemedView style={styles.deviceInfoContainer}>
              <ThemedText>
                {this.state.device.name} {this.state.device.address}
              </ThemedText>
              <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.state.device?.address && this.unpairDevice(this.state.device.address)}>
                <ThemedText style={[styles.listActionLink, styles.notLastButton]}>Unpair</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.state.connecting ? null : this.connect(this.state.device)}>
                <ThemedText style={this.state.connecting ? styles.listActionLinkGreyed : styles.listActionLink}>{this.state.connecting ? 'Connecting' : 'Connect'}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>Bonded devices</ThemedText>
          {this.state.bonded.length === 0 ? (
            <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
          ) : (
            this.state.bonded.map((device, index) => (
            <ThemedView key={index} style={styles.deviceInfoContainer}>
              <ThemedText>
                {device.name} {device.address}
              </ThemedText>
              <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.pairDevice(device.address)}>
                <ThemedText style={[styles.listActionLink, styles.notLastButton]}>Pair</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => this.state.connecting ? null : this.connect(device)}>
                <ThemedText style={this.state.connecting ? styles.listActionLinkGreyed : styles.listActionLink}>{this.state.connecting ? 'Connecting' : 'Connect'}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            ))
        )}
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>Connected devices</ThemedText>
          {this.state.connectedDevices.length === 0 ? (
            <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
          ) : (
            this.state.connectedDevices.map((device, index) => (
            <ThemedView key={index} style={styles.deviceInfoContainer}>
              <ThemedText>
                {device.name} {device.address}
              </ThemedText>
            </ThemedView>
            ))
        )}
        </ThemedView>

        <ThemedView style={styles.horizontalButtonContainer}>
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={async () => await this.write("SimpleMessage\n")}>
            <ThemedText style={styles.defaultButtonText}>Send packet</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.defaultButton]} onPress={async () => await this.read()}>
            <ThemedText style={styles.defaultButtonText}>Read packet</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.horizontalButtonContainer}>
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={async () => await this.acceptConnections()}>
            <ThemedText style={styles.defaultButtonText}>Accept connection</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.defaultButton]} onPress={async () => await this.available()}>
            <ThemedText style={styles.defaultButtonText}>Available</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView>
          <ThemedText style={styles.sectionTitle}>General stats</ThemedText>
          <ThemedText style={styles.sectionDescription}>Bluetooth enabled:
            <ThemedText> {this.state.enabled ? 'true' : 'false'}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>Bluetooth connection status:
            <ThemedText> {this.state.connectionStatus ? 'true' : 'false'}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>Bluetooth accepting mode:
            <ThemedText> {this.state.accepting ? 'true' : 'false'}</ThemedText>
          </ThemedText>
        </ThemedView>
      </>
    )
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
    marginTop: 30,
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
    alignSelf: 'center',
    fontSize: 12,
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

export default BlueComponent;