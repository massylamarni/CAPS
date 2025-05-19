import React from 'react';
import { ToastAndroid } from 'react-native';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { BlueState } from './blueClass';
import { addPredictionData, importDevices } from '@/utils/sqlite_db';

const TAG = "C/modelClass";

type ReceivedSensorData = {
  xa: number,
  ya: number,
  za: number,
  xg: number,
  yg: number,
  zg: number,
  DateTime: number,
  prediction: number,
  mac: string,
}

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

const SEGMENT_SIZE = 10;

export interface ModelState {
    isModelLoaded: boolean,
    isDbBuffered: boolean,
    predicting: boolean,
    predictions: any[],
    bufferEntriesCount: number,
}

interface ModelProps {
  modelBridge: {
    setModelState: (ModelState: any) => void,
    blueState: BlueState,
  }
}

class ModelComponent extends React.Component<ModelProps, ModelState> {
  // static defaultProps: Partial<ModelProps> = { }

  state: ModelState = {
    isModelLoaded: false,
    isDbBuffered: false,
    predicting: false,
    predictions: [],
    bufferEntriesCount: 0,
  };

  async componentDidMount () {
    await this.loadModel();
  }

  componentWillUnmount() {
    
  }

  componentDidUpdate(prevProps: Readonly<ModelProps>, prevState: Readonly<ModelState>, snapshot?: any): void {
    this.modelGetter();
    if (prevProps.modelBridge.blueState.receivedData != this.props.modelBridge.blueState.receivedData) {  // sensorState
      this.chunkAndProcess();
    }
  }

  private model = null as any;
  loadModel = async () => {
    try {
      await tf.ready();

      const modelJson = require('@/assets/models/model.json');
      const modelWeights = [require('@/assets/models/group1-shard1of1.bin')];
      const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      this.model = model;
    } catch (error) {
      ToastAndroid.show(`Classify: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ isModelLoaded: true });
    }
  }

  private stramBuffer = [] as any;
  private dbBuffer = [] as any;
  private chunkAndProcess = () => {
    if (this.model) {
      const receivedData = this.props.modelBridge.blueState.receivedData;
      if (receivedData[receivedData.length-1] !== "") {
        const data = JSON.parse(receivedData[receivedData.length-1]);
        if (data.sensorData) {
          const dbData = data.sensorData;
          dbData?.forEach((entry: any) => {
            if (this.dbBuffer.length < SEGMENT_SIZE) {
              this.dbBuffer.push(entry);
              this.setState(prev => ({ bufferEntriesCount: prev.bufferEntriesCount+1}));
            } else {
              this.processAndMakePrediction(this.dbBuffer);
              this.dbBuffer = [entry];
              this.setState({ bufferEntriesCount: 1});
            }
          });
          importDevices(data.devices);
          this.setState({ isDbBuffered: true });
        }
        else if (this.state.isDbBuffered) {
          if (this.stramBuffer.length < SEGMENT_SIZE) {
            this.stramBuffer.push(data);
            this.setState(prev => ({ bufferEntriesCount: prev.bufferEntriesCount+1}));
          } else {
            this.processAndMakePrediction(this.stramBuffer);
            this.stramBuffer = [data];
            this.setState({ bufferEntriesCount: 1});
          }
        }
      }   
    }
  }

  processAndMakePrediction = async (buffer: ReceivedSensorData[]) => {
    const MIN_A = -74.08409134, MAX_A = 43.37365402;
    const MIN_G = -16.51096916, MAX_G = 28.44993591;

    const preprocessSingleRow = (data: any): number[] => {  // Needs debug
      const normalizedData = {
        xa: (data.xa - MIN_A) / (MAX_A - MIN_A),
        ya: (data.ya - MIN_A) / (MAX_A - MIN_A),
        za: (data.za - MIN_A) / (MAX_A - MIN_A),
        xg: (data.xg - MIN_G) / (MAX_G - MIN_G),
        yg: (data.yg - MIN_G) / (MAX_G - MIN_G),
        zg: (data.zg - MIN_G) / (MAX_G - MIN_G),
      };

      return Object.values(normalizedData);
    }

    let preprocessedData = [] as number[][];
    buffer.forEach((entry, index) => {
      preprocessedData[index] = preprocessSingleRow(entry);
    });
    this.makePredictionAndSave(buffer[0], [preprocessedData]);
  }

  makePredictionAndSave = async (rawEntry: ReceivedSensorData, dataSegment: number[][][]) => {
    if (this.state.predicting) return;
    this.setState({ predicting: true });

    try {
      const inputTensor = tf.tensor(dataSegment, [1, 10, 6]);

      const output = await this.model.executeAsync(inputTensor);
      const prediction = output.arraySync();

      this.setState({ predictions: prediction });
      const confidence = Math.max(...prediction[0]);
      const predictedClass = prediction[0].indexOf(confidence);
      addPredictionData({...rawEntry, confidence: confidence, predictedClass: predictedClass});

      output.dispose();
      inputTensor.dispose();
    } catch (error) {
      ToastAndroid.show(`Classify: ${error}`, ToastAndroid.SHORT);
    } finally {
      this.setState({ predicting: false });
    }
  };

  modelGetter = () => {
    this.props.modelBridge.setModelState(this.state);
  }

  render() {
    return(
      <>
        
      </>
    )
  }
}

export default ModelComponent;