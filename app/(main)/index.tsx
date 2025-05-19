import React, { useEffect, useRef } from 'react';
import { View, ToastAndroid, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { useState } from 'react';
import SettingsComponent from './settingsComponent';

import { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import BlueComponent from './blueComponent';
import ModelComponent from './modelComponent';
import SensorComponent from './sensorComponent';
import DbComponent from './dbComponent';
import HistoryComponent from './historyComponent';
import { DbEntry } from '@/utils/sqlite_db';

export type BlueState = {
  arePermissionsGranted: boolean;
  setArePermissionsGranted: React.Dispatch<React.SetStateAction<boolean>>;
  isBluetoothEnabled: boolean;
  setIsBluetoothEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isDiscovering: boolean;
  setIsDiscovering: React.Dispatch<React.SetStateAction<boolean>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isDisconnecting: boolean;
  setIsDisconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isUnpairing: boolean;
  setIsUnpairing: React.Dispatch<React.SetStateAction<boolean>>;
  isAccepting: boolean;
  setIsAccepting: React.Dispatch<React.SetStateAction<boolean>>;
  isWriting: boolean;
  setIsWriting: React.Dispatch<React.SetStateAction<boolean>>;
  unpairedDevices: BluetoothDevice[];
  setUnpairedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  bondedDevices: BluetoothDevice[];
  setBondedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  connectedDevice: BluetoothDevice | null;
  setConnectedDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | null>>;
  receivedData: any[] | null;
  setReceivedData: React.Dispatch<React.SetStateAction<any[] | null>>;
  sendCount: number;
  setSendCount: React.Dispatch<React.SetStateAction<number>>;
  receiveCount: number;
  setReceiveCount: React.Dispatch<React.SetStateAction<number>>;
};

export type DbState = {
  isDbConnected: boolean;
  setIsDbConnected: React.Dispatch<React.SetStateAction<boolean>>;
  dbStats: {
    last_read: number;
    last_row: DbEntry | null;
    row_count: number;
  };
  setDbStats: React.Dispatch<
    React.SetStateAction<{
      last_read: number;
      last_row: DbEntry | null;
      row_count: number;
    }>
  >;
};

export type HistoryState = {
  lastRow: DbEntry[] | null;
  setLastRow: React.Dispatch<React.SetStateAction<DbEntry[] | null>>;
  predictionStats: { predictedClass: number; count: number }[] | null;
  setPredictionStats: React.Dispatch<
    React.SetStateAction<{ predictedClass: number; count: number }[] | null>
  >;
};

export type ModelState = {
  isModelLoaded: boolean;
  setIsModelLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isDbBuffered: boolean;
  setIsDbBuffered: React.Dispatch<React.SetStateAction<boolean>>;
  isPredicting: boolean;
  setIsPredicting: React.Dispatch<React.SetStateAction<boolean>>;
  predictions: any[]; // You can replace `any` with a proper prediction type later
  setPredictions: React.Dispatch<React.SetStateAction<any[]>>;
  bufferEntriesCount: number;
  setBufferEntriesCount: React.Dispatch<React.SetStateAction<number>>;
};

export type SensorSample = {
  xa: number;
  ya: number;
  za: number;
  xg: number;
  yg: number;
  zg: number;
};

export type SensorState = {
  sensorData: SensorSample[];
  setSensorData: React.Dispatch<React.SetStateAction<SensorSample[]>>;
  xaData: number[];
  setXaData: React.Dispatch<React.SetStateAction<number[]>>;
  yaData: number[];
  setYaData: React.Dispatch<React.SetStateAction<number[]>>;
  zaData: number[];
  setZaData: React.Dispatch<React.SetStateAction<number[]>>;
  xgData: number[];
  setXgData: React.Dispatch<React.SetStateAction<number[]>>;
  ygData: number[];
  setYgData: React.Dispatch<React.SetStateAction<number[]>>;
  zgData: number[];
  setZgData: React.Dispatch<React.SetStateAction<number[]>>;
};


export default function indexComponent() {
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
    last_row: null as DbEntry | null,
    row_count: 0,
  });

  /* HistoryState */
  const [lastRow, setLastRow] = useState(null as DbEntry[] | null);
  const [predictionStats, setPredictionStats] = useState(null as { predictedClass: number; count: number; }[] | null);

  /* ModelState */
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDbBuffered, setIsDbBuffered] = useState(false);
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
  const [settings, setSettings] = useState({
    isSimulating: false,
  });

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
    isModelLoaded,
    setIsModelLoaded,
    isDbBuffered,
    setIsDbBuffered,
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
    if (settings.isSimulating) {
      const syntheticDb = {
        sensorData: [
          {
            id: 1,
            DateTime: 1747259742546,
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
            DateTime: 1747260356807,
            xa: 0.4450,
            ya: -0.0915,
            za: 0.9174,
            xg: -0.0596,
            yg: -0.2700,
            zg: 0.0452,
            device_id: 1
          }
        ],
        devices: [
          {
            id: 1,
            mac: 'AA:BB:CC:DD:EE:01',
            name: 'Cattle I',
            created_at: 1747260000000
          },
          {
            id: 2,
            mac: 'AA:BB:CC:DD:EE:02',
            name: 'Cattle II',
            created_at: 1747260100000
          }
        ],
      };
      const syntheticData = {...sensorState.sensorData[0],
        DateTime: Date.now(),
        mac: 'MAC',
      };
      if (isDbBuffered) {
        setReceivedData(prev => (prev ? [...prev, JSON.stringify(syntheticData)] : [JSON.stringify(syntheticData)]));
      } else {
        setReceivedData(prev => (prev ? [...prev, JSON.stringify(syntheticData)] : [JSON.stringify(syntheticDb)]));
        setIsDbBuffered(true);
      }
    } else {
      setIsDbBuffered(false);
      setReceivedData([]);
    }
  }, [sensorState]);
  

  return(
    <>
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.VIEW}>
            {pageIndex == 0 && <>
              <BlueComponent blueState={blueState} />
              <ModelComponent modelState={modelState} receivedData={blueState.receivedData} />
              {settings.isSimulating && <SensorComponent sensorState={sensorState} settings={{show_title: true, show_coord: true}} />}
              <DbComponent dbState={dbState} />
            </>}
            {pageIndex == 1 && <>
              <HistoryComponent historyState={historyState} dbStats={dbState.dbStats} />
            </>}
            {pageIndex == 2 && <>
              <SettingsComponent setSettings={setSettings} />
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