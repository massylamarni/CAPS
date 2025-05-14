import React from 'react';
import { PermissionsAndroid, ToastAndroid } from 'react-native';
import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from "react-native-bluetooth-classic";

type BluetoothEventSubscription = /*unresolved*/ any
type StateChangeEvent = /*unresolved*/ any
type BluetoothDeviceEvent = /*unresolved*/ any

export interface BlueState {
  arePermissionsGranted: boolean,
  isBluetoothEnabled: boolean,
  isAcceptingConnections: boolean,
  discovering: boolean,
  scanning: boolean,
  pairing: boolean,
  connecting: boolean,
  unpairedDevices: BluetoothDevice[] | null,
  bondedDevices: BluetoothDevice[] | null,
  connectedDevices: BluetoothDevice[] | null,
  theDevice: BluetoothDevice | null,
}

export interface BlueProps {
  blueBridge: {
    setBlueState: (BlueState: any) => void,
    blueListeners: {
      onReceivedData: BluetoothEventSubscription,
    }
  }
}

class BlueComponent extends React.Component<BlueProps, BlueState> {
  // static defaultProps: Partial<BlueProps> = { }

  state: BlueState = {
    arePermissionsGranted: false,
    isBluetoothEnabled: false,
    discovering: false,
    scanning: false,
    pairing: false,
    connecting: false,
    isAcceptingConnections: false,
    unpairedDevices: [] as BluetoothDevice[],
    bondedDevices: [] as BluetoothDevice[],
    connectedDevices: [] as BluetoothDevice[],
    theDevice: null,
  };

  onBluetoothEnabledSub: BluetoothEventSubscription;
  onBluetoothDisabledSub: BluetoothEventSubscription;
  onDeviceConnectedSub: BluetoothEventSubscription;
  onDeviceDisconnectedSub: BluetoothEventSubscription;
  onBluetoothErrorSub: BluetoothEventSubscription;
  onReceivedDataSub: BluetoothEventSubscription;
  checkConnectionsInterval!: NodeJS.Timeout;

  async componentDidMount () {
    await this.initBluetooth();
    await this.initListeres();
    this.blueGetter();
  }

  componentWillUnmount() {    
    this.onBluetoothDisabledSub?.remove();
    this.onBluetoothEnabledSub?.remove();
    this.onDeviceConnectedSub?.remove();
    this.onDeviceDisconnectedSub?.remove();
    this.onBluetoothErrorSub?.remove();
    this.onReceivedDataSub?.remove();
    clearInterval(this.checkConnectionsInterval);
  }

  componentDidUpdate(prevProps: Readonly<BlueProps>, prevState: Readonly<BlueState>, snapshot?: any): void {
      this.blueGetter();
  }

  async initListeres() {
    const onBluetoothEnabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth enabled`, ToastAndroid.SHORT);
      this.setState({ isBluetoothEnabled: true });
      this.startDiscovery();
    }
    const onBluetoothDisabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth disabled`, ToastAndroid.SHORT);
      this.setState({ isBluetoothEnabled: false });
    }
    const onDeviceConnected = (event: BluetoothDeviceEvent) => {
      ToastAndroid.show(`Device connected`, ToastAndroid.SHORT);
      this.setState({ theDevice: event.device });
    }
    const onDeviceDisconnected = (event: BluetoothDeviceEvent) => {
      ToastAndroid.show(`Device disconnected`, ToastAndroid.SHORT);
      this.setState({ theDevice: event.device });
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
    this.onDeviceConnectedSub = RNBluetoothClassic.onDeviceConnected(onDeviceConnected);  // Not working
    this.onDeviceDisconnectedSub = RNBluetoothClassic.onDeviceDisconnected(onDeviceDisconnected); // Not working
    this.onBluetoothErrorSub = RNBluetoothClassic.onError(onBluetoothError);
  }

  receptionListener() {
    this.onReceivedDataSub = this.state.theDevice?.onDataReceived((receivedData) => 
      this.props.blueBridge.blueListeners.onReceivedData(receivedData)
    );
  }

  

  async initBluetooth() {
    // Ask permissions
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const arePermissionsGranted = Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
      this.setState({ arePermissionsGranted: arePermissionsGranted });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    };

    // Get Initial Bluetooth status
    try {
      const isBluetoothEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      this.setState({ isBluetoothEnabled: isBluetoothEnabled });
      if (isBluetoothEnabled) this.startDiscovery();
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
    
    // Broken connection event listener work around
    this.checkConnectionsInterval = setInterval(async () => {
      if (this.state.connectedDevices?.length === 0) {
        try {
          const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
          if (connectedDevices.length !== 0) {
            this.setState({ connectedDevices: connectedDevices, theDevice: connectedDevices[0] }, () => {
              this.startCommunication();
            });
          }
        } catch (error) {
          ToastAndroid.show(`Failed to get connected devices: ${error}`, ToastAndroid.SHORT);
        }
      }
    }, 3000);
    
  }

  async getBondedDevices() {
    try {
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      this.setState({ bondedDevices: bondedDevices });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async startDiscovery() {
    try {  
      this.setState({ discovering: true });
      const unpairedDevices = await RNBluetoothClassic.startDiscovery();
      ToastAndroid.show(`Found ${unpairedDevices.length} devices.`, ToastAndroid.SHORT);
      this.setState({ unpairedDevices: unpairedDevices });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ discovering: false });
    }
  }

  async cancelDiscovery() {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      if (cancelled) this.setState({ discovering: false });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async pairDevice(deviceAddr: string) {
    try {
      this.setState({ pairing: true });
      const theDevice = await RNBluetoothClassic.pairDevice(deviceAddr);
      this.setState({ theDevice: theDevice });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ pairing: false });
    }
  }

  async unpairDevice(deviceAddr: string) {
    try {
      const theDevice = await RNBluetoothClassic.unpairDevice(deviceAddr);
      this.setState({ theDevice: null });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async acceptConnections() {
    this.setState({ isAcceptingConnections: true });
      
    try {      
      const theDevice = await RNBluetoothClassic.accept({});
      this.setState({ theDevice: theDevice });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ isAcceptingConnections: false });
    }
  }

  async cancelAcceptConnections() {
    if (!this.state.isAcceptingConnections) {
      return;
    }

    try {
      await RNBluetoothClassic.cancelAccept();
      this.setState({ isAcceptingConnections: false });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async connect(_theDevice: BluetoothDevice | null) {
    try {
      this.setState({ connecting: true });
      const theDevice = this.state.theDevice ? this.state.theDevice : _theDevice;
      let connectionStatus = await theDevice?.isConnected();
      if (!connectionStatus) {
        connectionStatus = await theDevice?.connect();
      }
      this.setState({ connectedDevices: theDevice ? [theDevice] : null, theDevice: theDevice }, () => {
        this.receptionListener();
      });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ connecting: false });
    }
  }

  async disconnect() {
    try {
      const disconnected = await this.state.theDevice?.disconnect();
      this.setState({ connectedDevices: [], theDevice: null });
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async write(message: string) {
    try {
      const writeStatus = await this.state.theDevice?.write(message);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }

  async runPeripheralProcess() {
    this.startCommunication();

    if (this.state.theDevice) {
        ToastAndroid.show(`Device is connected, sending message...`, ToastAndroid.SHORT);
        await this.write("This is a message\n");
    } else {
      ToastAndroid.show(`Device is not connected, waiting for connection...`, ToastAndroid.SHORT);
      await this.acceptConnections();
    }
  }

  async startCommunication() {
    if (this.state.connectedDevices?.length !== 0) {
      if (!this.checkConnectionsInterval) this.receptionListener();
      if (true) {
        const formattedMessage = JSON.stringify("Hello");
        this.write(`${formattedMessage}\n`);
      }
    }
  }

  blueGetter() {
    this.props.blueBridge.setBlueState(this.state);
  }


  render() {
    return(
      <>
        
      </>
    )
  }
}

export default BlueComponent;