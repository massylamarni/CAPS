import { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { initDatabase, addSensorData, getAllData, resetDatabase } from '../utils/sqlite_db';

const SEGMENT_SIZE = 10 // 1sec at 10Hz

export default function SensorScreen() {
  const [sensorData, setSensorData] = useState([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
  const [dbData, setDbData] = useState([{"DateTime": 0, "XA": 0, "XG": 0, "YA": 0, "YG": 0, "ZA": 0, "ZG": 0, "id": 0}]);
  const [isRecording, setIsRecording] = useState(false);
  const sensorDataCount = useRef(0);
  const sensorDataParts = useRef({'accel': false, 'gyro': false});
  const intermediateSensorData = useRef({ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 });

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.gyroscope, 100);

    const assembleSensorData = (data, type) => {
      if (type == 'accel') {
        intermediateSensorData.current.xa = data.x;
        intermediateSensorData.current.ya = data.y;
        intermediateSensorData.current.za = data.z;
        sensorDataParts.current.accel = true;
      }
      else if (type == 'gyro') {
        intermediateSensorData.current.xg = data.x;
        intermediateSensorData.current.yg = data.y;
        intermediateSensorData.current.zg = data.z;
        sensorDataParts.current.gyro = true;
      }
      if (sensorDataParts.current.accel && sensorDataParts.current.gyro) {
        setSensorData(prev => {
          const newRef = [...prev];
          newRef[sensorDataCount.current] = intermediateSensorData.current;
          sensorDataCount.current++;
          return newRef;
        });
        
        sensorDataParts.current.accel = false;
        sensorDataParts.current.gyro = false;
      }
    }

    const accelSub = accelerometer.subscribe(data => assembleSensorData(data, 'accel'));
    const gyroSub = gyroscope.subscribe(data => assembleSensorData(data, 'gyro'));

    return () => {
      accelSub.remove();
      gyroSub.remove();
    };
  }, [isRecording]);

  // Initialize DB
  useEffect(() => {
    resetDatabase();
    setInterval(async () => {
      const tempDbData = await getAllData();
      tempDbData.length !== 0 ? setDbData(tempDbData) : console.log("DB isEmpty");;
    }, 3000);
  }, []);

  const saveToDatabase = async (sensorData) => {
    sensorData.forEach(async (data) => {
      await addSensorData(data);
      // console.log('Saving data batch:', data);
    });
  };

  // Save data to database
  useEffect(() => {
    if (!isRecording || sensorData.length < SEGMENT_SIZE) return;
    saveToDatabase(sensorData);
    setSensorData([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
    sensorDataCount.current = 0;
  }, [isRecording, sensorData]);

  return (
    <View style={styles.container}>
      <Text>Accelerometer:</Text>
      <Text>X: {sensorData[sensorData.length-1].xa.toFixed(2) ?? "N/A"}</Text>
      <Text>Y: {sensorData[sensorData.length-1].ya.toFixed(2) ?? "N/A"}</Text>
      <Text>Z: {sensorData[sensorData.length-1].za.toFixed(2) ?? "N/A"}</Text>

      <Text>Gyroscope:</Text>
      <Text>X: {sensorData[sensorData.length-1].xg.toFixed(2) ?? "N/A"}</Text>
      <Text>Y: {sensorData[sensorData.length-1].yg.toFixed(2) ?? "N/A"}</Text>
      <Text>Z: {sensorData[sensorData.length-1].zg.toFixed(2) ?? "N/A"}</Text>

      <Text>Database:</Text>
      <Text>ID: {dbData[0].id}</Text>
      <Text>XA: {dbData[0].XA.toFixed(2)}</Text>
      <Text>YA: {dbData[0].YA.toFixed(2)}</Text>
      <Text>ZA: {dbData[0].ZA.toFixed(2)}</Text>
      <Text>XG: {dbData[0].XG.toFixed(2)}</Text>
      <Text>YG: {dbData[0].YG.toFixed(2)}</Text>
      <Text>ZG: {dbData[0].ZG.toFixed(2)}</Text>
      <Text>DateTime: {dbData[0].DateTime}</Text>

      <Button 
        title={isRecording ? "Stop Recording" : "Start Recording"} 
        onPress={() => setIsRecording(!isRecording)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});