import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import SensorComponentP from './sensorComponentP';
import BlueComponentP from './blueComponentP';
import DbComponentP from './dbComponentP';
import HistoryComponentP from './historyComponentP';
import SettingsComponentP from './settingsComponentP';
import { useLogs } from '@/app/(main)/logContext';

const TAG = "P/index";

export default function IndexComponentP({ setRole }: {
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
  const [dbAnchor, setDbAnchor] = useState(null as string | null);
  const [isDbBufferedS, setIsDbBufferedS] = useState(false);

  /* DbState */
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbStats, setDbStats] = useState({
    last_read: 0,
    last_row: null as DbSensorOutputP | null,
    row_count: 0,
  });
  
  /* HistoryState */
  const [lastRow, setLastRow] = useState(null as DbSensorOutputP | null);
  const [predictionStats, setPredictionStats] = useState(null as { predictedClass: number; count: number; }[] | null);

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
    dbAnchor,
    setDbAnchor,
    isDbBufferedS,
    setIsDbBufferedS,
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

  return(
    <>
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.VIEW}>
            {pageIndex == 0 && <>
              <BlueComponentP blueState={blueState} sensorData={sensorState.sensorData} />
              <SensorComponentP sensorState={sensorState} sensorSettings={{show_title: true, show_coord: true}} />
              <DbComponentP dbState={dbState} sensorData={sensorState.sensorData} />
            </>}
            {pageIndex == 1 && <>
              <HistoryComponentP historyState={historyState} dbStats={dbState.dbStats} />
            </>}
            {pageIndex == 2 && <>
              <SettingsComponentP setRole={setRole} />
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