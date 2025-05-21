import React, { useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import { useState } from 'react';
import SettingsComponent from './settingsComponentC';
import BlueComponentC from './blueComponentC';
import ModelComponentC from './modelComponentC';
import SensorComponentC from './sensorComponentC';
import DbComponentC from './dbComponentC';
import HistoryComponentC from './historyComponentC';
import { BluetoothDevice } from "react-native-bluetooth-classic";
import { useLogs } from '@/app/(main)/logContext';

const TAG = "C/index";
type GraphModel = /*unresolved*/ any

export default function IndexComponentC({ setRole }: {
  setRole: React.Dispatch<React.SetStateAction<'CENTRAL' | 'PERIPHERAL'>>,
}) {
  /* BlueState */
  const [arePermissionsGranted, setArePermissionsGranted] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [unpairedDevices, setUnpairedDevices] = useState([] as BluetoothDevice[]);
  const [bondedDevices, setBondedDevices] = useState([] as BluetoothDevice[]);
  const [connectedDevice, setConnectedDevice] = useState(null as BluetoothDevice | null);
  const [receivedData, setReceivedData] = useState(null as any[] | null);
  const [sendCount, setSendCount] = useState(0);
  const [receiveCount, setReceiveCount] = useState(0);

  /* DbState */
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbStats, setDbStats] = useState({
    last_read: 0,
    last_row: null as DbPredictionOutputC | null,
    row_count: 0,
  });

  /* HistoryState */
  const [lastRow, setLastRow] = useState(null as DbPredictionOutputC[] | null);
  const [predictionStats, setPredictionStats] = useState(null as { predictedClass: number; count: number; }[] | null);

  /* ModelState */
  const [model, setModel] = useState(null as GraphModel | null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDbBufferedR, setIsDbBufferedR] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState([] as any[]);
  const [bufferEntriesCount, setBufferEntriesCount] = useState(0);

  /* sensorState */
  const [sensorData, setSensorData] = useState([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
  const [xaData, setXaData] = useState([0] as number[]);
  const [yaData, setYaData] = useState([0] as number[]);
  const [zaData, setZaData] = useState([0] as number[]);
  const [xgData, setXgData] = useState([0] as number[]);
  const [ygData, setYgData] = useState([0] as number[]);
  const [zgData, setZgData] = useState([0] as number[]);

  /* IndexState */
  const [pageIndex, setPageIndex] = useState(0);
  const [isDbBufferedSS, setIsDbBufferedSS] = useState(false);
  const [settings, setSettings] = useState({
    isSimulating: false,
  });
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
        setReceivedData(prev => (prev ? [...prev, JSON.stringify(syntheticData)] : [JSON.stringify(syntheticData)]));
      } else {
        setReceivedData(prev => (prev ? [...prev, JSON.stringify(syntheticDb)] : [JSON.stringify(syntheticDb)]));
        setIsDbBufferedSS(true);
      }
    } else {
      setIsDbBufferedSS(false);
      setReceivedData([]);
    }
  }, [sensorState.sensorData]);
  
  return(
    <>
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.VIEW}>
            {pageIndex == 0 && <>
              <BlueComponentC blueState={blueState} />
              <ModelComponentC modelState={modelState} receivedData={blueState.receivedData} />
              {settings.isSimulating && <SensorComponentC sensorState={sensorState} settings={{show_title: true, show_coord: true}} />}
              <DbComponentC dbState={dbState} isPredicting={modelState.isPredicting} />
            </>}
            {pageIndex == 1 && <>
              <HistoryComponentC historyState={historyState} dbStats={dbState.dbStats} />
            </>}
            {pageIndex == 2 && <>
              <SettingsComponent setSettings={setSettings} setRole={setRole} />
            </>}
          </View>
        </ScrollView>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => setPageIndex(0)} style={[styles.navButton]}><Tex>Home</Tex></TouchableOpacity>
          <TouchableOpacity onPress={() => setPageIndex(1)} style={[styles.navButton]}><Tex>History</Tex></TouchableOpacity>
          <TouchableOpacity onPress={() => setPageIndex(2)} style={[styles.navButton]}><Tex>Settings</Tex></TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}