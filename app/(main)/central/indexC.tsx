import React, { useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SettingsComponent from './settingsComponentC';
import BlueComponentC from './blueComponentC';
import ModelComponentC from './modelComponentC';
import SensorComponentC from './sensorComponentC';
import DbComponentC from './dbComponentC';
import HistoryComponentC from './historyComponentC';
import { BluetoothDevice } from "react-native-bluetooth-classic";
import { useLogs } from '@/utils/logContext';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';
import { RECEIVE_BUFFER_SIZE } from '@/utils/constants';
import { lang } from '@/assets/languages/lang-provider';


const TAG = "C/index";

type GraphModel = /*unresolved*/ any

export default function IndexComponentC({ setRole }: {
  setRole: React.Dispatch<React.SetStateAction<'CENTRAL' | 'PERIPHERAL'>>,
}) {
  /* BlueState */
  const [arePermissionsGranted, setArePermissionsGranted] = useState(false, "setArePermissionsGranted");
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false, "setIsBluetoothEnabled");
  const [isDiscovering, setIsDiscovering] = useState(false, "setIsDiscovering");
  const [isConnecting, setIsConnecting] = useState(false, "setIsConnecting");
  const [isDisconnecting, setIsDisconnecting] = useState(false, "setIsDisconnecting");
  const [isUnpairing, setIsUnpairing] = useState(false, "setIsUnpairing");
  const [isAccepting, setIsAccepting] = useState(false, "setIsAccepting");
  const [isWriting, setIsWriting] = useState(false, "setIsWriting");
  const [unpairedDevices, setUnpairedDevices] = useState([] as BluetoothDevice[], "setUnpairedDevices");
  const [bondedDevices, setBondedDevices] = useState([] as BluetoothDevice[], "setBondedDevices");
  const [connectedDevice, setConnectedDevice] = useState(null as BluetoothDevice | null, "setConnectedDevice");
  const [receivedData, setReceivedData] = useState(null as any[] | null, "setReceivedData");
  const [sendCount, setSendCount] = useState(0, "setSendCount");
  const [receiveCount, setReceiveCount] = useState(0, "setReceiveCount");

  /* DbState */
  const [isDbConnected, setIsDbConnected] = useState(false, "setIsDbConnected");
  const [dbStats, setDbStats] = useState({
    last_read: 0,
    last_row: null as DbPredictionOutputC | null,
    row_count: 0,
  }, "setDbStats");

  /* HistoryState */
  const [lastRow, setLastRow] = useState(null as DbPredictionOutputC[] | null, "setLastRow");
  const [predictionStats, setPredictionStats] = useState(null as { predictedClass: number; count: number; }[] | null, "setPredictionStats");

  /* ModelState */
  const [model, setModel] = useState(null as GraphModel | null, "setModel");
  const [isModelLoaded, setIsModelLoaded] = useState(false, "setIsModelLoaded");
  const [isDbBufferedR, setIsDbBufferedR] = useState(false, "setIsDbBufferedR");
  const [isPredicting, setIsPredicting] = useState(false, "setIsPredicting");
  const [predictions, setPredictions] = useState([] as any[], "setPredictions");
  const [bufferEntriesCount, setBufferEntriesCount] = useState(0, "setBufferEntriesCount");

  /* sensorState */
  const [sensorData, setSensorData] = useState([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }], "setSensorData");
  const [xaData, setXaData] = useState([0] as number[], "setXaData");
  const [yaData, setYaData] = useState([0] as number[], "setYaData");
  const [zaData, setZaData] = useState([0] as number[], "setZaData");
  const [xgData, setXgData] = useState([0] as number[], "setXgData");
  const [ygData, setYgData] = useState([0] as number[], "setYgData");
  const [zgData, setZgData] = useState([0] as number[], "setZgData");

  /* IndexState */
  const [pageIndex, setPageIndex] = useState(0, "setPageIndex");
  const [isDbBufferedSS, setIsDbBufferedSS] = useState(false, "setIsDbBufferedSS");
  const [settings, setSettings] = useState({
    isSimulating: false,
  }, "setSettings");
  const { addLog } = useLogs();

  const blueState = {
    arePermissionsGranted,
    setArePermissionsGranted,
    isBluetoothEnabled,
    setIsBluetoothEnabled,
    isDiscovering,
    setIsDiscovering,
    isConnecting,
    setIsConnecting,
    isDisconnecting,
    setIsDisconnecting,
    isUnpairing,
    setIsUnpairing,
    isAccepting,
    setIsAccepting,
    isWriting,
    setIsWriting,
    unpairedDevices,
    setUnpairedDevices,
    bondedDevices,
    setBondedDevices,
    connectedDevice,
    setConnectedDevice,
    receivedData,
    setReceivedData,
    sendCount,
    setSendCount,
    receiveCount,
    setReceiveCount,
  };

  const dbState = {
    isDbConnected,
    setIsDbConnected,
    dbStats,
    setDbStats,
  };

  const historyState = {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  };

  const modelState = {
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
  };

  const sensorState = {
    sensorData,
    setSensorData,
    xaData,
    setXaData,
    yaData,
    setYaData,
    zaData,
    setZaData,
    xgData,
    setXgData,
    ygData,
    setYgData,
    zgData,
    setZgData,
  };

  useEffect(() => {
    addLog(TAG, '------------------------------');
  }, []);

  useEffect(() => {
    if (settings.isSimulating) {
      const syntheticDb = {
        sensorData: [
          {
            id: 1,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 2,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 1,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 2,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 3,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 4,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 5,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 6,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 7,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 8,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 9,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 10,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          },
          {
            id: 11,
            createdAt: 1747259742546,
            xa: -0.5056,
            ya: 0.9077,
            za: 0.2639,
            xg: -0.0799,
            yg: 0.0884,
            zg: 0.1017,
            device_id: 2
          },
          {
            id: 12,
            createdAt: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          }
        ],
      };
      const syntheticData = {...sensorState.sensorData[0],
        createdAt: Date.now(),
        mac: 'MAC',
      };
      if (isDbBufferedSS) {
        setReceivedData((prev: any) => (prev ? [...prev.slice(-(RECEIVE_BUFFER_SIZE-1)), JSON.stringify(syntheticData)] : [JSON.stringify(syntheticData)]));
      } else {
        setReceivedData((prev: any) => (prev ? [...prev.slice(-(RECEIVE_BUFFER_SIZE-1)), JSON.stringify(syntheticDb)] : [JSON.stringify(syntheticDb)]));
        setIsDbBufferedSS(true);
      }
    } else {
      setIsDbBufferedSS(false);
    }
  }, [sensorState.sensorData]);
  
  return(
    <>
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.VIEW, pageIndex !== 0 && styles.HIDDEN]}>
            <BlueComponentC blueState={blueState} />
            <ModelComponentC modelState={modelState} receivedData={blueState.receivedData} />
            {settings.isSimulating && <SensorComponentC sensorState={sensorState} sensorSettings={{show_title: true, show_coord: true}} />}
            <DbComponentC dbState={dbState} predictions={modelState.predictions} />
          </View>
          <View style={[styles.VIEW, pageIndex !== 1 && styles.HIDDEN]}>
            <HistoryComponentC historyState={historyState} dbStats={dbState.dbStats} />
          </View>
          <View style={[styles.VIEW, pageIndex !== 2 && styles.HIDDEN]}>
            <SettingsComponent setSettings={setSettings} setRole={setRole} />
          </View>
        </ScrollView>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => setPageIndex(0)} style={[styles.navButton]}><Tex>{lang["home"]}</Tex></TouchableOpacity>
          <TouchableOpacity onPress={() => setPageIndex(1)} style={[styles.navButton]}><Tex>{lang["history"]}</Tex></TouchableOpacity>
          <TouchableOpacity onPress={() => setPageIndex(2)} style={[styles.navButton]}><Tex>{lang["settings"]}</Tex></TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}