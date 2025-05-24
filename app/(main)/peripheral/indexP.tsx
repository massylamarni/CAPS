import React, { useEffect } from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import SensorComponentP from './sensorComponentP';
import BlueComponentP from './blueComponentP';
import DbComponentP from './dbComponentP';
import HistoryComponentP from './historyComponentP';
import SettingsComponentP from './settingsComponentP';
import { useLogs } from '@/utils/logContext';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';

const TAG = "P/index";

export default function IndexComponentP({ setRole }: {
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
  const [dbAnchor, setDbAnchor] = useState(null as string | null, "setDbAnchor");
  const [isDbBufferedS, setIsDbBufferedS] = useState(false, "setIsDbBufferedS");

  /* DbState */
  const [isDbConnected, setIsDbConnected] = useState(false, "setIsDbConnected");
  const [dbStats, setDbStats] = useState({
    last_read: 0,
    last_row: null as DbSensorOutputP | null,
    row_count: 0,
  }, "setDbStats");
  
  /* HistoryState */
  const [lastRow, setLastRow] = useState(null as DbSensorOutputP | null, "setLastRow");

  /* sensorState */
  const [sensorData, setSensorData] = useState({ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }, "setSensorData");
  const [xyzData, setXyzData] = useState({xa: [], ya: [], za: [], xg: [], yg: [], zg: []} as {xa: number[], ya: number[], za: number[], xg: number[], yg: number[], zg: number[]}, "setXyzData");

  /* IndexState */
  const [pageIndex, setPageIndex] = useState(0, "setPageIndex");
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
  };

  const sensorState = {
    sensorData,
    setSensorData,
    xyzData,
    setXyzData,
  };
  
  useEffect(() => {
    addLog(TAG, '------------------------------');
  }, []);

  return(
    <>
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.VIEW, pageIndex !== 0 && styles.HIDDEN]}>
            <BlueComponentP blueState={blueState} sensorData={sensorState.sensorData} />
            <SensorComponentP sensorState={sensorState} sensorSettings={{show_title: true, show_coord: true}} />
            <DbComponentP dbState={dbState} sensorData={sensorState.sensorData} />
          </View>
          <View style={[styles.VIEW, pageIndex !== 1 && styles.HIDDEN]}>
            <HistoryComponentP historyState={historyState} dbStats={dbState.dbStats} />
          </View>
          <View style={[styles.VIEW, pageIndex !== 2 && styles.HIDDEN]}>
            <SettingsComponentP setRole={setRole} />
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