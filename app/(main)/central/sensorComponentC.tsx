import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import SensorLineChart from '../mini-components/sensorLineChart';
import { useLogs } from '@/utils/logContext';
import { FREQUENCY, DRAWING_SEQUENCE_LENGTH } from '@/utils/constants';

const TAG = "C/sensorComponent";

export default function SensorComponentC({ sensorState, sensorSettings }: {sensorState: SensorStateC, sensorSettings:SensorViewSettingsC}) {
  const { addLog } = useLogs();

  const {
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
  } = sensorState;

  /* Init sensorData */
  useEffect(() => {
    Accelerometer.setUpdateInterval(FREQUENCY);
    Gyroscope.setUpdateInterval(FREQUENCY);
    let accelData = {x: 0, y: 0, z: 0};
    let gyroData = {x: 0, y: 0, z: 0};
    const accelSubscription = Accelerometer.addListener((data: SensorData) => {
        accelData = data;
    });
    const gyroSubscription = Gyroscope.addListener((data: SensorData) => {
        gyroData = data;
    });
    const sensorDataInterval = setInterval(() => {
      const groupedData = {
          xa: accelData.x,
          ya: accelData.y,
          za: accelData.z,
          xg: gyroData.x,
          yg: gyroData.y,
          zg: gyroData.z
      };

      setSensorData([groupedData]);
    }, FREQUENCY);

    return () => {
      accelSubscription?.remove();
      gyroSubscription?.remove();
      clearInterval(sensorDataInterval);
    }
  }, []);

  useEffect(() => {

    if (sensorState.sensorData) {
      const { xa, ya, za, xg, yg, zg } = sensorState.sensorData[sensorState.sensorData.length - 1];
      setXaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), xa]);
      setYaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), ya]);
      setZaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), za]);
      setXgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), xg]);
      setYgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), yg]);
      setZgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), zg]);
    }
  }, [sensorState.sensorData]);

  return (
    <>
      <SimpleCard title={sensorSettings.show_title ? 'SensorInfo' : null}>
        <View style={[styles.MINI_SENSOR_CHART]}>
          <View style={styles.MINI_SENSOR_CHART_HEADER}>
            <Tex style={styles.SUBCOMPONENT_TITLE}>Accelerometer</Tex>
            {(sensorSettings.show_coord && sensorState.sensorData) && <Tex>
              x: {sensorState.sensorData[sensorState.sensorData.length-1]?.xa.toFixed(3)},
              y: {sensorState.sensorData[sensorState.sensorData.length-1]?.ya.toFixed(3)},
              z: {sensorState.sensorData[sensorState.sensorData.length-1]?.za.toFixed(3)}
            </Tex>}
          </View>
          <SensorLineChart xyzData={{xData: xaData, yData: yaData, zData: zaData}} />
        </View>
        <View style={styles.MINI_SENSOR_CHART}>
          <View style={styles.MINI_SENSOR_CHART_HEADER}>
            <Tex style={styles.SUBCOMPONENT_TITLE}>Gyroscope</Tex>
            {(sensorSettings.show_coord && sensorState.sensorData) && <Tex>
              x: {sensorState.sensorData[sensorState.sensorData.length-1]?.xg.toFixed(3)},
              y: {sensorState.sensorData[sensorState.sensorData.length-1]?.yg.toFixed(3)},
              z: {sensorState.sensorData[sensorState.sensorData.length-1]?.zg.toFixed(3)}
            </Tex>}
          </View>
          <SensorLineChart xyzData={{xData: xgData, yData: ygData, zData: zgData}} />
        </View>
      </SimpleCard>
    </>
  );
}
  