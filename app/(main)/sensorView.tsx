import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { SensorState } from './sensorClass';

type sensor_view_settings_t = {
  show_title: boolean;
  show_coord: boolean;
}

export default function SensorView({ sensorState: sensorState, settings: settings }: {sensorState: SensorState, settings:sensor_view_settings_t}) {
  
  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.sensor_info]}>
        {settings.show_title && <Tex style={styles.COMPONENT_TITLE} >
          Sensor Info
        </Tex>}
        <View style={styles.COMPONENT_WRAPPER}>
          <View style={[styles.MINI_SENSOR_CHART, styles.COMPONENT_WRAPPER]}>
            <View style={styles.MINI_SENSOR_CHART_HEADER}>
              <Tex style={styles.SUBCOMPONENT_TITLE}>Accelerometer</Tex>
              {(settings.show_coord && sensorState.sensorData) && <Tex>
                x: {sensorState.sensorData[sensorState.sensorData.length-1]?.xa.toFixed(3)},
                y: {sensorState.sensorData[sensorState.sensorData.length-1]?.ya.toFixed(3)},
                z: {sensorState.sensorData[sensorState.sensorData.length-1]?.za.toFixed(3)}
              </Tex>}
            </View>
            <View style={styles.MINI_SENSOR_CHART_BODY}>
            </View>
          </View>
          <View style={styles.MINI_SENSOR_CHART}>
            <View style={styles.MINI_SENSOR_CHART_HEADER}>
              <Tex style={styles.SUBCOMPONENT_TITLE}>Gyroscope</Tex>
              {(settings.show_coord && sensorState.sensorData) && <Tex>
                x: {sensorState.sensorData[sensorState.sensorData.length-1]?.xg.toFixed(3)},
                y: {sensorState.sensorData[sensorState.sensorData.length-1]?.yg.toFixed(3)},
                z: {sensorState.sensorData[sensorState.sensorData.length-1]?.zg.toFixed(3)}
              </Tex>}
            </View>
            <View style={styles.MINI_SENSOR_CHART_BODY}>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
  