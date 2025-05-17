import React, { useEffect, useRef } from 'react';
import { View, ToastAndroid, TouchableOpacity, PanResponder } from 'react-native';
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

const ROLE = "P";

export default function indexComponent() {
  const [pageIndex, setPageIndex] = useState(0);
  const [blueState, setBlueState] = useState({} as BlueState);
  const [sensorState, setSensorState] = useState({} as SensorState);
  const [modelState, setModelState] = useState({} as ModelState);
  const [dbState, setDbState] = useState({} as DbState);

  const blueBridge = {
    setBlueState: setBlueState,
  }
  const blueRef = useRef<BlueComponent>(null);


  const sensorBridge = {
    setSensorState: setSensorState,
  }

  const modelBridge = {
    setModelState: setModelState,
    blueState: blueState,
  }

  const dbBridge = {
    setDbState: setDbState,
    sensorState: sensorState,
    blueState: blueState,
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe right - go to previous page
        setPageIndex(prev => ( prev > 0 ? prev - 1 : 2 ));
      } else if (gestureState.dx < -50) {
        // Swipe left - go to next page
        setPageIndex(prev => ( prev < 2 ? prev + 1 : 0 ));
      }
    },
  });

  return(
    <>
      <BlueComponent ref={blueRef} blueBridge={blueBridge} />
      <ModelComponent modelBridge={modelBridge} />
      <DbComponent dbBridge={dbBridge} />
      <View {...panResponder.panHandlers}>
        <View style={styles.MAIN}>
          {pageIndex == 0 && <>
            <SensorComponent sensorBridge={sensorBridge} />
            <BlueView blueState={blueState} blueRef={blueRef} sensorState={sensorState} role={'P'} />
            <SensorView sensorState={sensorState} settings={{show_title: true, show_coord: true}} />
            <DbView dbState={dbState} />
          </>}
          {pageIndex == 1 && <>
            <BlueView blueState={blueState} blueRef={blueRef} sensorState={sensorState} role={'C'} />
            <ModelView modelState={modelState} />
            <DbView dbState={dbState} />
          </>}
          {pageIndex == 2 && <>
            <HistoryView />
          </>}
        </View>
      </View>
    </>
  );
}