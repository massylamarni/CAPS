import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Tex from '@/app/(main)/base-components/tex';
import { useEffect, useState } from 'react';
import { addPredictionData } from '@/utils/sqlite_db_c';
import SimpleCard from '../mini-components/simpleCard';
import ProbabilityItem from '../mini-components/probabilityItem';
import { useLogs } from '@/app/(main)/logContext';
import { NEW_BEHAVIOR_MAPPING, MIN_A, MAX_A, MIN_G, MAX_G } from '../constants';

const TAG = "C/modelComponent";

const SEGMENT_SIZE = 10;

export default function ModelComponentC({ modelState, receivedData }: { modelState: ModelStateC, receivedData: BlueStateC["receivedData"]}) {
  const [streamBuffer, setStreamBuffer] = useState([] as any);
  const [dbBuffer, setDbBuffer] = useState([] as any);
  const { addLog } = useLogs();

  const {
    model,
    setModel,
    isModelLoaded,
    setIsModelLoaded,
    isDbBufferedR,
    setIsDbBufferedR,
    isPredicting,
    setIsPredicting,
    predictions,
    setPredictions,
    bufferEntriesCount,
    setBufferEntriesCount,
  } = modelState;

  useEffect(() => {
    initModel();
  }, []);

  useEffect(() => {
    chunkAndProcess();
  }, [receivedData]);

  const initModel = () => {
    loadModel();
  }
  const loadModel = async () => {
    try {
      addLog(TAG, `Loading model...`);
      await tf.ready();

      const modelJson = require('@/assets/models/model.json');
      const modelWeights = [require('@/assets/models/group1-shard1of1.bin')];
      const model_ = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      addLog(TAG, `Model loaded !`);
      setModel(model_);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsModelLoaded(true);
    }
  }

  const chunkAndProcess = () => {
    if (model) {
      const receivedData_ = receivedData;
      if (receivedData_ && receivedData_[receivedData_.length-1] && receivedData_[receivedData_.length-1] !== "") {
        const data = JSON.parse(receivedData_[receivedData_.length-1]);
        if (data.sensorData) {
          addLog(TAG, `Chunking received database...`);
          const dbData = data.sensorData;
          dbData?.forEach((entry: any) => {
            if (dbBuffer.length < SEGMENT_SIZE) {
              setDbBuffer((prev: any) => [...prev, entry]);
              setBufferEntriesCount(dbBuffer.length);
            } else {
              processAndMakePrediction(dbBuffer);
              setDbBuffer([entry]);
              setBufferEntriesCount(1)
            }
          });
          setIsDbBufferedR(true);
        }
        else if (isDbBufferedR) {
          addLog(TAG, `Chunking received stream...`);
          if (streamBuffer.length < SEGMENT_SIZE) {
            setStreamBuffer((prev: any) => [...prev, data]);
            setBufferEntriesCount(streamBuffer.length);
          } else {
            processAndMakePrediction(streamBuffer);
            setStreamBuffer([data]);
            setBufferEntriesCount(1);
          }
        }
      }   
    }
  }

  const processAndMakePrediction = async (buffer: ReceivedSensorDataC[]) => {
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
    makePredictionAndSave(buffer[0], [preprocessedData]);
  }

  const makePredictionAndSave = async (rawEntry: ReceivedSensorDataC, dataSegment: number[][][]) => {
    if (isPredicting) return;
    setIsPredicting(true);

    try {
      const inputTensor = tf.tensor(dataSegment, [1, 10, 6]);
      addLog(TAG, `Making a prediction...`);
      const output = await model!.predict(inputTensor);
      const prediction_ = output.arraySync();

      setPredictions(prediction_);
      const confidence = Math.max(...prediction_[0]);
      const predictedClass = prediction_[0].indexOf(confidence);
      addLog(TAG, `Saving prediction...`);
      addPredictionData({...rawEntry, confidence: confidence, predictedClass: predictedClass});

      output.dispose();
      inputTensor.dispose();
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <>
      <SimpleCard title='Model info' >
        {predictions && <>
          {predictions.length != 0 && (predictions[0].map((prediction: any, index: any) => (
            <ProbabilityItem key={index} itemKey={NEW_BEHAVIOR_MAPPING[index]} itemValue={prediction.toFixed(2) * 100} />
          )))}
        </>}
        <>
          <Tex>{isModelLoaded ? 'Model loaded !' : 'Loading model...'}</Tex>
          <Tex>{`Processing chunk ${bufferEntriesCount}/10...`}</Tex>
          {isDbBufferedR && <Tex>Database buffered !</Tex>}
          {isPredicting && <Tex>Predicting...</Tex>}
        </>
      </SimpleCard>
    </>
  );
}
  