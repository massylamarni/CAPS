import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { initDatabase, addSensorData, getAllData, resetDatabase } from '@/utils/sqlite_db';

type sensor_data_t = {
  x: number;
  y: number;
  z: number;
}

type sensor_db_entry_t = {
    xa: number;
    ya: number;
    za: number;
    xg: number;
    yg: number;
    zg: number;
}

const SEGMENT_SIZE = 10 // 1sec at 10Hz

export default function SensorScreen() {
    const [sensorData, setSensorData] = useState([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
    const [dbData, setDbData] = useState([{"DateTime": 0, "XA": 0, "XG": 0, "YA": 0, "YG": 0, "ZA": 0, "ZG": 0, "id": 0}]);
    const [isRecording, setIsRecording] = useState(false);
    const sensorDataCount = useRef(0);
    const sensorDataParts = useRef({'accel': false, 'gyro': false});
    const intermediateSensorData = useRef({ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 });
  
    useEffect(() => {
      Accelerometer.setUpdateInterval(100); // 100ms = 10Hz
      Gyroscope.setUpdateInterval(100);
  
      const assembleSensorData = (data: sensor_data_t, type: 'accel' | 'gyro') => {
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
  
      const accelSubscription = Accelerometer.addListener((data: sensor_data_t) => {
        assembleSensorData(data, 'accel');
      });
  
      const gyroSubscription = Gyroscope.addListener((data: sensor_data_t) => {
        assembleSensorData(data, 'gyro');
      });
  
      return () => {
        accelSubscription.remove();
        gyroSubscription.remove();
      };
    }, [isRecording]);
  
    // Initialize DB
    useEffect(() => {
      resetDatabase();
      setInterval(async () => {
        const tempDbData = await getAllData();
        tempDbData.length !== 0 ? setDbData(tempDbData) : console.log("isEmpty");;
      }, 3000);
    }, []);
  
    const saveToDatabase = async (sensorData: sensor_db_entry_t[]) => {
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
        <ThemedText>Accelerometer:</ThemedText>
        <ThemedText>X: {sensorData.at(-1)?.xa.toFixed(2) ?? "N/A"}</ThemedText>
        <ThemedText>Y: {sensorData.at(-1)?.ya.toFixed(2) ?? "N/A"}</ThemedText>
        <ThemedText>Z: {sensorData.at(-1)?.za.toFixed(2) ?? "N/A"}</ThemedText>
  
        <ThemedText>Gyroscope:</ThemedText>
        <ThemedText>X: {sensorData.at(-1)?.xg.toFixed(2) ?? "N/A"}</ThemedText>
        <ThemedText>Y: {sensorData.at(-1)?.yg.toFixed(2) ?? "N/A"}</ThemedText>
        <ThemedText>Z: {sensorData.at(-1)?.zg.toFixed(2) ?? "N/A"}</ThemedText>
  
        <ThemedText>Database:</ThemedText>
        <ThemedText>ID: {dbData[0].id}</ThemedText>
        <ThemedText>XA: {dbData[0].XA.toFixed(2)}</ThemedText>
        <ThemedText>YA: {dbData[0].YA.toFixed(2)}</ThemedText>
        <ThemedText>ZA: {dbData[0].ZA.toFixed(2)}</ThemedText>
        <ThemedText>XG: {dbData[0].XG.toFixed(2)}</ThemedText>
        <ThemedText>YG: {dbData[0].YG.toFixed(2)}</ThemedText>
        <ThemedText>ZG: {dbData[0].ZG.toFixed(2)}</ThemedText>
        <ThemedText>DateTime: {dbData[0].DateTime}</ThemedText>
  
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