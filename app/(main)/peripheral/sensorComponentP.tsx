import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import SensorLineChart from '../mini-components/sensorLineChart';
import { useLogs } from '@/utils/logContext';
import { FREQUENCY, DRAWING_SEQUENCE_LENGTH } from '@/utils/constants';
import { lang } from '@/assets/languages/lang-provider';
import SimpleSubCard from '../mini-components/simpleSubcard';

const TAG = "P/sensorComponent";

export default function SensorComponentP({ sensorState, sensorSettings }: {sensorState: SensorStateP, sensorSettings:SensorViewSettingsP}) {
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
      
      setXaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.x]);
      setYaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.y]);
      setZaData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), accelData.z]);
      setXgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.x]);
      setYgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.y]);
      setZgData(prev => [...prev.slice(-(DRAWING_SEQUENCE_LENGTH-1)), gyroData.z]);

      setSensorData([groupedData]);
    }, FREQUENCY);

    return () => {
      accelSubscription?.remove();
      gyroSubscription?.remove();
      clearInterval(sensorDataInterval);
    }
  }, []);
  
  const lastSensorData = sensorState.sensorData[sensorState.sensorData.length-1];

  return (
    <>
      <SimpleCard title={sensorSettings.show_title ? lang["sensor_info"] : null}>
        <SimpleSubCard title={lang["accelerometer"]} potentialValue={(sensorSettings.show_coord && sensorState.sensorData) ?
          `x: ${lastSensorData?.xa.toFixed(3)}, y: ${lastSensorData?.ya.toFixed(3)}, z: ${lastSensorData?.za.toFixed(3)}` : ''}>
          <SensorLineChart xyzData={{xData: xaData, yData: yaData, zData: zaData}} />
        </SimpleSubCard>
        <SimpleSubCard title={lang["gyroscope"]} potentialValue={(sensorSettings.show_coord && sensorState.sensorData) ?
          `x: ${lastSensorData?.xg.toFixed(3)}, y: ${lastSensorData?.yg.toFixed(3)}, z: ${lastSensorData?.zg.toFixed(3)}` : ''}>
          <SensorLineChart xyzData={{xData: xgData, yData: ygData, zData: zgData}} />
        </SimpleSubCard>
      </SimpleCard>
    </>
  );
}
  