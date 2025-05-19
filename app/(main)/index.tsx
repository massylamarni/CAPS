import React, { useEffect, useRef } from 'react';
import { View, ToastAndroid, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import BlueView from './blueView';
import SensorView from './sensorView';
import DbView from './dbView';
import ModelView from './modelView';
import HistoryView from './historyView';
import { useState } from 'react';
import BlueComponent, { BlueState } from './blueClass';
import SensorComponent, { SensorState } from './sensorClass';
import ModelComponent, {ModelState} from './modelClass';
import DbComponent, {DbState} from './dbClass';
import SettingsView from './settingsView';

export default function indexComponent() {
  const [pageIndex, setPageIndex] = useState(0);
  const [blueState, setBlueState] = useState({} as BlueState);
  const [modelState, setModelState] = useState({} as ModelState);
  const [dbState, setDbState] = useState({} as DbState);
  const [sensorState, setSensorState] = useState({} as SensorState);
  const [isDbBuffered, setIsDbBuffered] = useState(false);
  
  const [settings, setSettings] = useState({
    isSimulating: false,
  });

  const blueBridge = {
    setBlueState: setBlueState,
  }
  const blueRef = useRef<BlueComponent>(null);

  const modelBridge = {
    setModelState: setModelState,
    blueState: blueState,
  }

  const dbBridge = {
    setDbState: setDbState,
    blueState: blueState,
  }

  const sensorBridge = {
    setSensorState: setSensorState,
  }

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
        blueRef.current?.setState(prev => ({ receivedData: [...prev.receivedData, JSON.stringify(syntheticData)]}));
      } else {
        blueRef.current?.setState(prev => ({ receivedData: [...prev.receivedData, JSON.stringify(syntheticDb)]}));
        setIsDbBuffered(true);
      }
    } else {
      setIsDbBuffered(false);
      blueRef.current?.setState({ receivedData: []});
    }
  }, [sensorState]);
  

  return(
    <>
      <BlueComponent ref={blueRef} blueBridge={blueBridge} />
      <ModelComponent modelBridge={modelBridge} />
      <DbComponent dbBridge={dbBridge} />
      {settings.isSimulating && <SensorComponent sensorBridge={sensorBridge} />}
      <SafeAreaView style={styles.MAIN}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.VIEW}>
            {pageIndex == 0 && <>
              <BlueView blueState={blueState} blueRef={blueRef} />
              <ModelView modelState={modelState} />
              {settings.isSimulating && <SensorView sensorState={sensorState} settings={{show_title: true, show_coord: true}} />}
              <DbView dbState={dbState} />
            </>}
            {pageIndex == 1 && <>
              <HistoryView dbState={dbState} />
            </>}
            {pageIndex == 2 && <>
              <SettingsView setSettings={setSettings} />
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