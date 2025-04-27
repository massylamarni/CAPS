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
import DebugBluetooth from './debugBluetooth';


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
type MyComponentState = /*unresolved*/ any

class BlueComponent extends React.Component {
  state: {
    role: "CENTRAL" | "PERIPHERAL" | null,
    arePermissionsGranted: boolean,
    isBluetoothEnabled: boolean,
    isAcceptingConnections: boolean,
    discovering: boolean,
    scanning: boolean,
    pairing: boolean,
    connecting: boolean,
    unpairedDevices: BluetoothDevice[],
    bondedDevices: BluetoothDevice[],
    connectedDevices: BluetoothDevice[],
    theDevice: BluetoothDevice | null,
    receivedData: {},

    model: any,
    predictions: [],
    sensorData: [],
  } = {
    role: null,
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
    receivedData: {},

    model: null,
    predictions: [],
    sensorData: [],
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

    await this.loadModel();
  }

  componetWillUnmount() {    
    this.onBluetoothDisabledSub.remove();
    this.onBluetoothEnabledSub.remove();
    this.onDeviceConnectedSub.remove();
    this.onDeviceDisconnectedSub.remove();
    this.onBluetoothErrorSub.remove();
    this.onReceivedDataSub.remove();
    clearInterval(this.checkConnectionsInterval);
  }

  componentDidUpdate(prevProps: {}, prevState: MyComponentState) {
    if (prevState.sensorData !== this.state.sensorData) {
      const sensorData = this.state.sensorData;
      if (sensorData.length !== 0 && (sensorData.length % 30 === 0)) {
        const preprocessSingleRow = (data: any): number[] => {
          const MIN_A = -5, MAX_A = 5;
          const MIN_G = -5, MAX_G = 5;
          const normalizedData = data.map(entry => ({
            xa: (entry.xa - MIN_A) / (MAX_A - MIN_A),
            ya: (entry.ya - MIN_A) / (MAX_A - MIN_A),
            za: (entry.za - MIN_A) / (MAX_A - MIN_A),
            xg: (entry.xg - MIN_G) / (MAX_G - MIN_G),
            yg: (entry.yg - MIN_G) / (MAX_G - MIN_G),
            zg: (entry.zg - MIN_G) / (MAX_G - MIN_G),
          }));

          return Object.values(normalizedData[0]);
        }

        let preprocessedData = [];
        for (let i = 0; i < 10; i++) {
          preprocessedData[i] = preprocessSingleRow(sensorData[sensorData.length-1-i]);
        }
        this.makePrediction([preprocessedData]);
      }
    }
  }

  async initListeres() {
    const onBluetoothEnabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth enabled`, ToastAndroid.SHORT);
      this.setState({ isBluetoothEnabled: event.enabled });
    }
    const onBluetoothDisabled = (event: StateChangeEvent) => {
      ToastAndroid.show(`Bluetooth disabled`, ToastAndroid.SHORT);
      this.setState({ isBluetoothEnabled: !event.enabled });
    }
    const onDeviceConnected = (event: BluetoothDeviceEvent) => {
      ToastAndroid.show(`Device connected`, ToastAndroid.SHORT);
      console.log("DEVICE CONNNECTED");
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
    console.log("Reception Listener added on theDevice: ");
    console.log(this.state.theDevice);
    const onReceivedData = (event: BluetoothReadEvent) => {
      console.log("Message received");
      this.setState({receivedData: {
        ...event,
        timestamp: new Date(),  // Add the current date
        type: 'receive'         // Add a type for UI
      }}, () => {
        const processedMessage = JSON.parse(this.state.receivedData.data);
        this.appendToSensorData(processedMessage);
      });
    }

    this.onReceivedDataSub = this.state.theDevice?.onDataReceived((receivedData) => onReceivedData(receivedData));
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
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
    
    // Broken connection event listener work around
    this.checkConnectionsInterval = setInterval(async () => {
      if (this.state.connectedDevices.length === 0) {
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
      ToastAndroid.show(`Found ${unpairedDevices.length} unpaired devices.`, ToastAndroid.SHORT);
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
      this.setState({ theDevice: theDevice });
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
      this.setState({ connectedDevices: [theDevice], theDevice: theDevice }, () => {
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

  async runCentralProcess() {
    /*
      Get paired devices
      Search for device with specific name
      +Connect to device
      -Discover devices
      -Search for device with specific name
      -Connect to device
    */
   
    const DEVICE_NAME = "Galaxy M14";
    this.setState({ role: "CENTRAL" });
    this.startCommunication();

    const connectAfterPair = async (deviceAddr: string) => {
      try {
        this.setState({ pairing: true });
        const theDevice = await RNBluetoothClassic.pairDevice(deviceAddr);
        this.setState({ theDevice: theDevice }, () => {
          this.connect(this.state.theDevice);
        });
      } catch (error) {
        ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
      } finally {
        this.setState({ pairing: false });
      }
    }

    const pairAfterDiscovery = async () => {
      try {
        this.setState({ discovering: true });
        const unpairedDevices = await RNBluetoothClassic.startDiscovery();
        ToastAndroid.show(`Found ${unpairedDevices.length} unpaired devices.`, ToastAndroid.SHORT);
        this.setState({ unpairedDevices: unpairedDevices }, () => {
          if (this.state.unpairedDevices.length !== 0) {
            this.state.unpairedDevices.forEach(async (unpairedDevice) => {
              console.log(unpairedDevice.name);
              if (unpairedDevice.name === DEVICE_NAME) await connectAfterPair(unpairedDevice.address);
            });
          }
        });
      } catch (error) {
        ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
      } finally {
        this.setState({ discovering: false });
      }
    }

    const connectAfterBonding = async () => {
      try {
        const bondedDevices = await RNBluetoothClassic.getBondedDevices();
        this.setState({ bondedDevices: bondedDevices }, () => {
          let watcher = false;
          if (this.state.bondedDevices.length !== 0) {
            this.state.bondedDevices.forEach(async (bondedDevice) => {
              console.log(bondedDevice.name);
              if (bondedDevice.name === DEVICE_NAME) {
                this.connect(bondedDevice);
                watcher = true;
                console.log("Device found in bonding, now connecting...");
              }
            });
          }
          if (!watcher) {
            console.log("Device not found in bonding, now discovering...");
            pairAfterDiscovery();
          }
        });
      } catch (error) {
        ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
      }
    }

    connectAfterBonding();
  }

  async runPeripheralProcess() {
    /*
      isAcceptingConnections is true
      When connection is made, send data
    */
    const DEVICE_NAME = "Galaxy";
    this.setState({ role: "PERIPHERAL" });
    this.startCommunication();

    if (this.state.connectedDevices.length !== 0) {
      this.state.connectedDevices.forEach(async (connectedDevice) => {
        ToastAndroid.show(`Device is connected, sending message...`, ToastAndroid.SHORT);
        if (connectedDevice.name === DEVICE_NAME) await this.write("This is a message\n");
      });
    } else {
      ToastAndroid.show(`Device is not connected, waiting for connection...`, ToastAndroid.SHORT);
      await this.acceptConnections();
    }
  }

  async loadModel() {
    try {
      console.log("Classify: ", "Initialising TensorflowJs...");
      await tf.ready();

      const modelJson = require('@/assets/models/model.json');
      const modelWeights = [require('@/assets/models/group1-shard1of1.bin')];
      console.log("Classify: ", "Loading model...");
      const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      this.setState({ model: model });
      console.log("Classify: ", "Model loaded !");
    } catch (error) {
      ToastAndroid.show(`Classify: ${error}`, ToastAndroid.SHORT);
    }
  }

  async makePrediction(dataSegment: number[][][]) {
    try {
      const inputTensor = tf.tensor(dataSegment, [1, 10, 6]);

      console.log("Classify: ", "Predicting...");
      const output = await this.state.model.executeAsync(inputTensor);
      const prediction = await output.arraySync();
      this.setState(prev => ({ predictions: [...prev.predictions, prediction] }), () => {
        console.log(this.state.predictions[this.state.predictions.length-1]);
      });
    } catch (error) {
      ToastAndroid.show(`Classify: ${error}`, ToastAndroid.SHORT);
    }
  }

  async startCommunication() {
    if (this.state.connectedDevices.length !== 0 && this.state.sensorData.length !== 0) {
      if (!this.checkConnectionsInterval) this.receptionListener();
      if (this.state.role === "PERIPHERAL") {
        const formattedMessage = JSON.stringify(this.state.sensorData[this.state.sensorData.length-1]);
        this.write(`${formattedMessage}\n`);
      }
    }
  }

  appendToSensorData(sensorData: any) {
    this.setState((prev) => ({ sensorData: [...prev.sensorData, sensorData] }));
  }

  setSensorData(sensorData: any) {
    this.setState({ sensorData: sensorData });
  }
 
  render() {
    return(
      <>
        {this.state.role === "PERIPHERAL" && <SensorScreen sensorDataBridge={this} readMode={"REAL_TIME"} showComponent={false} />}
        {false && <DebugBluetooth BlueComponentInst={this} />}
        <ThemedView style={styles.horizontalButtonContainer}>
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={() => this.runCentralProcess()}>
            <ThemedText style={styles.defaultButtonText}>Pick CENTRAL role</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.defaultButton} onPress={() => this.runPeripheralProcess()}>
            <ThemedText style={styles.defaultButtonText}>Pick PERIPHERAL role</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView>
          <ThemedText style={styles.sectionDescription}>Role:
            <ThemedText style={styles.highlight}> {this.state.role ? this.state.role : "Not selected"}</ThemedText>
          </ThemedText>
          {this.state.role === "CENTRAL" && (
            <ThemedText style={styles.sectionDescription}>Received:
              <ThemedText style={styles.highlight}> {this.state.receivedData.data ? this.state.receivedData.data : "Nothing"}</ThemedText>
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.sectionTitle}>Connected devices</ThemedText>
            {this.state.connectedDevices.length === 0 ? (
              <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
            ) : (
              this.state.connectedDevices.map((device: any, index: any) => (
              <ThemedView key={index} style={styles.deviceInfoContainer}>
                <ThemedText>
                  {device.name} {device.address}
                </ThemedText>
              </ThemedView>
              ))
          )}
        </ThemedView>
        <ThemedView>
          {this.state.predictions.length !== 0 && (
          <ThemedView>
            <ThemedText style={styles.sectionTitle}>Prediction</ThemedText>
            {this.state.predictions[this.state.predictions.length-1][0].map((prediction: any, index: any) => {
              const actionMapping = ["Grazing", "Standing", "Walking", "Resting", "Licking"];
              return (
                <ThemedText key={index} style={styles.sectionDescription}>{actionMapping[index]}: {prediction.toFixed(2) * 100}</ThemedText>
              )
            })}
          </ThemedView>
          )}
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