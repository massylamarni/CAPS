import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Tex from '@/app/(main)/base-components/tex';
import { useEffect } from 'react';
import { addPredictionData } from '@/utils/sqlite_db_c';
import SimpleCard from '../mini-components/simpleCard';
import ProbabilityItem from '../mini-components/probabilityItem';
import { useLogs } from '@/utils/logContext';
import { useLangs } from "@/utils/langContext";
import { BEHAVIOR_MAPPING, INPUT_0, INPUT_1, INPUT_2, INPUT_3, INPUT_7, INPUT_8, MIN_A, MAX_A, MIN_G, MAX_G, INPUT_SEQUENCE_LENGTH, RAW_0 } from '@/utils/constants';
import { useStateLogger as useState } from '@/utils/useStateLogger';

const TAG = "C/modelComponent";

export default function ModelComponentC({ modelState, receivedData, address }: { modelState: ModelStateC, receivedData: BlueStateC["receivedData"], address: 'string' | undefined}) {
  const [streamBuffer, setStreamBuffer] = useState([] as any, "setStreamBuffer");
  const [dbBuffer, setDbBuffer] = useState([] as any, "setDbBuffer");
  const [receivedHeader, setReceivedHeader] = useState({ dbLength: null }, "setReceivedHeader");
  const [dbReceptionProgress, setDbReceptionProgress] = useState(0, "setDbReceptionProgress");
  const { addLog } = useLogs();
  const { lang } = useLangs();

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

  /* On header reception */
  useEffect(() => {
    if (receivedHeader.dbLength) {
      const maxProgress = 100;
      const estimatedTransferRate = 100;
      const totalTime = (receivedHeader.dbLength / estimatedTransferRate) * 1000;
      const updateInterval = 100; // ms
      const step = maxProgress / (totalTime / updateInterval);

      let current = 0;
      const interval = setInterval(() => {
        current += step;
        if (current >= maxProgress) {
          current = maxProgress;
          clearInterval(interval);
        }
        setDbReceptionProgress(Math.round(current));
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [receivedHeader]);

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
      setIsModelLoaded(true);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }

  const chunkAndProcess = () => {
    if (model) {
      const receivedData_ = receivedData;
      if (receivedData_ && receivedData_[receivedData_.length-1]) {
        const data = JSON.parse(receivedData_[receivedData_.length-1]);

        if (data.header) {
          addLog(TAG, `Header received !`);
          setReceivedHeader(data.header);
        }
        else if (data.savedSensorData) {
          addLog(TAG, `Chunking received database...`);
          const dbData = data.savedSensorData;
          let dbBuffer_ = [...dbBuffer];
          dbData.forEach((entry: any) => {
            if (dbBuffer_.length < INPUT_SEQUENCE_LENGTH) {
              dbBuffer_.push(entry);
            } else {
              processAndMakePrediction(dbBuffer_);
              dbBuffer_ = [entry];
            }
            setDbBuffer(dbBuffer_);
          });
          setIsDbBufferedR(true);
          setDbBuffer([]);
        }
        else if (isDbBufferedR) {
          addLog(TAG, `Chunking received stream...`);
          let streamBuffer_ = [...streamBuffer];
          if (streamBuffer_.length < INPUT_SEQUENCE_LENGTH) {
            streamBuffer_.push(data);
          } else {
            processAndMakePrediction(streamBuffer_);
            streamBuffer_ = [data];
          }
          setStreamBuffer(streamBuffer_);
        }
      }   
    }
  }
  const processAndMakePrediction = async (buffer: ReceivedSensorDataC[]) => {
    const preprocessSingleRow = (data: any): number[] => {
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
      const output = model!.predict(inputTensor);
      const prediction_ = output.arraySync();

      setPredictions(prediction_);
      const confidence = Math.max(...prediction_[0]);
      const predictedClass = prediction_[0].indexOf(confidence);
      addLog(TAG, `Saving prediction...`);
      addPredictionData({...rawEntry, mac: address ?? 'MAC__', confidence: confidence, predictedClass: predictedClass});

      if (Array.isArray(output)) {
        output.forEach(t => t.dispose());
      } else {
        output.dispose();
      }
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
        {(predictions && isDbBufferedR) ? <>
          {predictions.length != 0 && (predictions[0].map((prediction: any, index: any) => (
            <ProbabilityItem key={index} itemKey={lang[BEHAVIOR_MAPPING[index]]} itemValue={prediction.toFixed(2) * 100} />
          )))}
          <Tex>{`${lang["processing_chunk"]} ${dbBuffer.length + streamBuffer.length}/10...`}</Tex>
          {isPredicting && <Tex>{lang["making_a_prediction"]}</Tex>}
        </> : <>
          {dbReceptionProgress ? <>
            {address && <Tex>{`${lang["receiving_from"]} ${address}`}</Tex>}
            <Tex>{`${lang["loading"]} ${dbReceptionProgress}%`}</Tex>
          </> : <>
            <Tex>{lang["waiting_for_data_reception"]}</Tex>
          </>}
        </>}
      </SimpleCard>
    </>
  );
}
  