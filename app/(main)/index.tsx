import React from 'react';
import { PermissionsAndroid, ToastAndroid, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from "react-native-bluetooth-classic";
import SensorScreen from './sensorScreen';

//import { loadTensorflowModel } from 'react-native-fast-tflite';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';


//import { Asset } from 'expo-asset';

const input_3 = [
  [
    [0.6624112139793409, 0.4200060111869891, 0.4646516004657842, 0.3875061240709629, 0.4287423407000519, 0.5171309258532488],
    [0.6628299547332885, 0.4195025735362296, 0.4685028912995902, 0.3878291737275873, 0.4284215801318585, 0.5163942165126556],
    [0.6688074788228011, 0.4175752338641255, 0.4668788987177354, 0.3891926764560933, 0.427182689467234, 0.5162667516870747],
    [0.6668708028795028, 0.4187925010265112, 0.4684345925703116, 0.3906416452981648, 0.4270451318756214, 0.5162328401509361],
    [0.6694460584568359, 0.42100912949664, 0.468631900069596, 0.3891071184439089, 0.426613211040961, 0.5158734704651884],
    [0.6635418139940189, 0.42020888904906, 0.4669547862116106, 0.3871102149576058, 0.4272121597375872, 0.5163926753544372],
    [0.6698805019829371, 0.418059886530445, 0.4676074187501911, 0.3891161113436679, 0.4263255559316367, 0.514686850788216],
    [0.6714874195711371, 0.4196979373995047, 0.4681348369264125, 0.3891608320455183, 0.4262197117265175, 0.5148362995604744],
    [0.6671848584274798, 0.4193673216281824, 0.4675618862640054, 0.3897963598028359, 0.4259373620390133, 0.5146958614884632],
    [0.6667451806673056, 0.4184806702396288, 0.4653307936297559, 0.3906488247809737, 0.4246669191623711, 0.5165415440954203],
  ],
];
const input_2 = [
  [
    [0.4576845170691376, 0.5472049289164199, 0.3838602076327739, 0.3067157058726193, 0.5892478748234392, 0.6903455844105368],
    [0.4735883938730019, 0.5093642140954012, 0.4223106662133445, 0.3348949870138169, 0.6049067765395407, 0.6901636651918653],
    [0.4142643528278688, 0.5812780233122252, 0.5227806837668588, 0.3449708513072441, 0.5480435594736972, 0.6802039620858592],
    [0.3832272249326021, 0.548385535976737, 0.4774846485947832, 0.3241371691827008, 0.5884505044858266, 0.651488283838233],
    [0.4053349923403329, 0.5808941647435149, 0.4791145477458562, 0.3182756031240631, 0.6189300137743408, 0.6750858710117407],
    [0.4282805501095142, 0.5433405374326997, 0.4503828367500206, 0.3232775013094096, 0.6725426428032335, 0.6400912344829455],
    [0.4461852258186917, 0.5433824715774471, 0.4215942688774269, 0.3576988367146012, 0.6463092716878698, 0.6618345794475594],
    [0.4635525845225234, 0.5464081804248133, 0.4591388067099888, 0.3221469638822654, 0.6254163809191358, 0.6740276172430771],
    [0.4388395365598681, 0.5944356633967233, 0.4333560760620906, 0.3422656703470397, 0.6241900705773027, 0.6612293236163832],
    [0.4748256370303961, 0.5280119996404757, 0.403953453069681, 0.2938916203690769, 0.6350915434916222, 0.67519818433455],
  ],
];

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
    model: any,
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
    model: null,
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
    await this.loadModelAsync();
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

  async loadModelAsync() {
    //.ts: const loadModel = async ():Promise<void|tf.LayersModel>=>{
    try {
      await tf.ready();
      console.log("tf ready");

      const tensor1 = tf.tensor([1, 2, 3]);
      const tensor2 = tf.tensor([4, 5, 6]);
      const sum = tensor1.add(tensor2);
      console.log("Reading sum");
      console.log(sum);

      const modelJson = require('@/assets/models/model.json');
      const modelWeights = [require('@/assets/models/group1-shard1of1.bin')];
      const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      console.log('Model loaded');

      const input = tf.randomNormal([1, 10, 6]);
      const input_3t = tf.tensor(input_3, [1, 10, 6]);
      const input_2t = tf.tensor(input_2, [1, 10, 6]);

      const output = await model.executeAsync(input_2t);
      const predictions = await output.arraySync();
      console.log(predictions);

    } catch (e) {
      console.log("[READY ERROR] info:", e);
    }
  
    /*
    const modelAsset = Asset.fromModule(require('@/assets/models/model.tflite'));
    await modelAsset.downloadAsync();
    
    const modelPath = modelAsset.localUri ?? modelAsset.uri;
    console.log("Model path: " + modelPath);
    
    try {
      console.log('Starting model load...');
      // Directly load the model using require
      const tfliteModel = await loadTensorflowModel({ url: modelPath });
      console.log('Model loaded successfully:', tfliteModel);
    } catch (error) {
      console.error('Error loading model:', error);
    }
    /*
    this.setState({ model: model }, async () => {
      await this.runPrediction(null);
    });
    */
  };

  async runPrediction(inputData: any) {
    const output = await this.state.model.run(input_2);  // Run inference on the model
    console.log('Prediction output:', output);
  };

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