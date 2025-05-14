import React from 'react';
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

const ROLE = "P";

export default function indexComponent() {
  const [pageIndex, setPageIndex] = useState(0);
  const [blueState, setBlueState] = useState({} as BlueState);
  const [sensorState, setSensorState] = useState({} as SensorState);
  const [modelState, setModelState] = useState({} as ModelState);
  
  const onReceivedData = (data: any) => {
    console.log("Data received");
  }

  const blueBridge = {
    setBlueState: setBlueState,
    blueListeners: {
      onReceivedData: onReceivedData,
    }
  }

  const sensorBridge = {
    setSensorState: setSensorState,
  }

  const modelBridge = {
    setModelState: setModelState,
    sensorState: sensorState,
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
      <BlueComponent blueBridge={blueBridge} />
      <SensorComponent sensorBridge={sensorBridge} />
      <ModelComponent modelBridge={modelBridge} />
      <View {...panResponder.panHandlers}>
        <View style={styles.MAIN}>
          {pageIndex == 0 && <>
            <BlueView blueState={blueState} role={'P'} />
            <SensorView sensorState={sensorState} settings={{show_title: true, show_coord: true}} />
            <DbView sensorState={sensorState} mac={blueState.theDevice?.address} />
          </>}
          {pageIndex == 1 && <>
            <BlueView blueState={blueState} role={'C'} />
            <ModelView modelState={modelState} />
            <DbView sensorState={sensorState} mac={blueState.theDevice?.address} />
          </>}
          {pageIndex == 2 && <>
            <HistoryView />
          </>}
        </View>
      </View>
    </>
  );
}