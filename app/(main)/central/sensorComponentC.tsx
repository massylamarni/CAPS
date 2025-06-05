import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import SensorLineChart from '../mini-components/sensorLineChart';
import { useLogs } from '@/utils/logContext';
import { useLangs } from "@/utils/langContext";
import { FREQUENCY, DRAWING_SEQUENCE_LENGTH } from '@/utils/constants';
import SimpleSubCard from '../mini-components/simpleSubcard';

const TAG = "C/sensorComponent";

export default function SensorComponentC({ sensorState, sensorSettings }: {sensorState: SensorStateP, sensorSettings:SensorViewSettingsP}) {
  const { addLog } = useLogs();
  const { lang } = useLangs();
  
  const {
    sensorData,
    setSensorData,
    xyzData,
    setXyzData,
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
      setXyzData(prev => ({
        xa: [...prev.xa.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.x],
        ya: [...prev.ya.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.y],
        za: [...prev.za.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.z],
        xg: [...prev.xg.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.x],
        yg: [...prev.yg.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.y],
        zg: [...prev.zg.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.z],
      }));

      const weights = {
        xa: -1,
        ya: 1,
        za: 0,
        xg: -1,
        yg: -1,
        zg: -1,
      };

      setSensorData({
        xa: accelData.x + weights.xa,
        ya: accelData.y + weights.ya,
        za: accelData.z + weights.za,
        xg: gyroData.x + weights.xg,
        yg: gyroData.y + weights.yg,
        zg: gyroData.z + weights.zg
      });
    }, FREQUENCY);

    return () => {
      accelSubscription?.remove();
      gyroSubscription?.remove();
      clearInterval(sensorDataInterval);
    }
  }, []);

  return (
    <>
      <SimpleCard title={sensorSettings.show_title ? lang["sensor_info"] : null}>
        <SimpleSubCard title={lang["accelerometer"]} potentialValue={(sensorSettings.show_coord && sensorState.sensorData) ?
          `x: ${sensorState.sensorData?.xa.toFixed(3)}, y: ${sensorState.sensorData?.ya.toFixed(3)}, z: ${sensorState.sensorData?.za.toFixed(3)}` : ''}>
          <SensorLineChart xyzData={{xData: xyzData.xa, yData: xyzData.ya, zData: xyzData.za}} />
        </SimpleSubCard>
        <SimpleSubCard title={lang["gyroscope"]} potentialValue={(sensorSettings.show_coord && sensorState.sensorData) ?
          `x: ${sensorState.sensorData?.xg.toFixed(3)}, y: ${sensorState.sensorData?.yg.toFixed(3)}, z: ${sensorState.sensorData?.zg.toFixed(3)}` : ''}>
          <SensorLineChart xyzData={{xData: xyzData.xg, yData: xyzData.yg, zData: xyzData.zg}} />
        </SimpleSubCard>
      </SimpleCard>
    </>
  );
}
  