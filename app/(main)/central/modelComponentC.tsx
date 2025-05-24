import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Tex from '@/app/(main)/base-components/tex';
import { useEffect } from 'react';
import { addPredictionData } from '@/utils/sqlite_db_c';
import SimpleCard from '../mini-components/simpleCard';
import ProbabilityItem from '../mini-components/probabilityItem';
import { useLogs } from '@/utils/logContext';
import { BEHAVIOR_MAPPING, MIN_A, MAX_A, MIN_G, MAX_G, INPUT_SEQUENCE_LENGTH } from '@/utils/constants';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';
import { lang } from '@/assets/languages/lang-provider';

const TAG = "C/modelComponent";

export default function ModelComponentC({ modelState, receivedData }: { modelState: ModelStateC, receivedData: BlueStateC["receivedData"]}) {
  const [streamBuffer, setStreamBuffer] = useState([] as any, "setStreamBuffer");
  const [dbBuffer, setDbBuffer] = useState([] as any, "setDbBuffer");
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
      if (receivedData_ && receivedData_[receivedData_.length-1]) {
        const data = JSON.parse(receivedData_[receivedData_.length-1]);
        if (data.sensorData) {
          addLog(TAG, `Chunking received database...`);
          const dbData = data.sensorData;
          dbData?.forEach((entry: any) => {
            if (dbBuffer.length < INPUT_SEQUENCE_LENGTH) {
              setDbBuffer((prev: any) => [...prev, entry]);
            } else {
              processAndMakePrediction(dbBuffer);
              setDbBuffer([entry]);
            }
          });
          setIsDbBufferedR(true);
          setDbBuffer([]);
        }
        else if (isDbBufferedR) {
          addLog(TAG, `Chunking received stream...`);
          if (streamBuffer.length < INPUT_SEQUENCE_LENGTH) {
            setStreamBuffer((prev: any) => [...prev, data]);
          } else {
            processAndMakePrediction(streamBuffer);
            setStreamBuffer([data]);
          }
        }
      }   
    }
  }

  const processAndMakePrediction = async (buffer: ReceivedSensorDataC[]) => {
    console.log(buffer);
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
      <SimpleCard title={lang["model_info"]} >
        {predictions && <>
          {predictions.length != 0 && (predictions[0].map((prediction: any, index: any) => (
            <ProbabilityItem key={index} itemKey={BEHAVIOR_MAPPING[index]} itemValue={prediction.toFixed(2) * 100} />
          )))}
        </>}
        <>
          <Tex>{isModelLoaded ? lang["model_loaded"] : lang["loading_model"]}</Tex>
          <Tex>{`${lang["processing_chunk"]} ${dbBuffer.length+streamBuffer.length}/10...`}</Tex>
          {isDbBufferedR && <Tex>{lang["database_buffered"]}</Tex>}
          {isPredicting && <Tex>{lang["making_a_prediction"]}</Tex>}
        </>
      </SimpleCard>
    </>
  );
}
  