import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

const SAVE_SEGMENT_SIZE = 10 // 1sec at 10Hz

export default function SensorScreen({ sensorDataBridge, readMode, showComponent }: any) {
    const [sensorData, setSensorData] = useState([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
    const [dbData, setDbData] = useState([{"DateTime": 0, "XA": 0, "XG": 0, "YA": 0, "YG": 0, "ZA": 0, "ZG": 0, "id": 0}]);
    const [isRecording, setIsRecording] = useState(false);
    const sensorDataCount = useRef(0);
    const sensorDataParts = useRef({'accel': false, 'gyro': false});
    const intermediateSensorData = useRef({ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 });
  
    // Get sensor data
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
      /*
      setInterval(async () => {
        const tempDbData = await getAllData();
        tempDbData.length !== 0 ? setDbData(tempDbData) : console.log("isEmpty");
      }, 3000);
      */
    }, []);
  
    // Save data to database
    useEffect(() => {
      if (!isRecording || sensorData.length < SAVE_SEGMENT_SIZE) return;
      const saveToDatabase = async (sensorData: sensor_db_entry_t[]) => {
        sensorData.forEach(async (data) => {
          await addSensorData(data);
        });
      };

      saveToDatabase(sensorData);
      setSensorData([{ xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 }]);
      sensorDataCount.current = 0;
    }, [isRecording, sensorData]);

    // Send data
    useEffect(() => {
      if (readMode === "REAL_TIME") {
        sensorDataBridge.appendToSensorData([sensorData[sensorData.length-1]]);
      }
      else if (readMode === "FETCH_AND_KEEP") {
        setInterval(async () => {
          const tempDbData = await getAllData();
          sensorDataBridge.appendToSensorData(tempDbData);
        }, 3000);
      }
    }, [sensorData]);
  
    return (
      <>
        {showComponent && <View style={styles.sectionContainer}>
          <ThemedText style={styles.masterTitle}>Sensor Screen</ThemedText>
          <ThemedText style={styles.sectionDescription}>Accelerometer:{' '}
            <ThemedText style={styles.highlight}>{`X: ${sensorData[sensorData.length-1].xa.toFixed(2) ?? "N/A"}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Y: ${sensorData[sensorData.length-1].ya.toFixed(2) ?? "N/A"}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Z: ${sensorData[sensorData.length-1].za.toFixed(2) ?? "N/A"}`}</ThemedText>
          </ThemedText>
  
          <ThemedText style={styles.sectionDescription}>Gyroscope:{' '}
            <ThemedText style={styles.highlight}>{`X: ${sensorData[sensorData.length-1].xg.toFixed(2) ?? "N/A"}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Y: ${sensorData[sensorData.length-1].yg.toFixed(2) ?? "N/A"}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Z: ${sensorData[sensorData.length-1].zg.toFixed(2) ?? "N/A"}`}</ThemedText>
          </ThemedText>
  
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>DataBase</ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>id:{' '}
            <ThemedText style={styles.highlight}>{dbData[0].id}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>DateTime:{' '}
            <ThemedText style={styles.highlight}>{dbData[0].DateTime}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>Accelerometer:{' '}
            <ThemedText style={styles.highlight}>{`X: ${dbData[0].XA.toFixed(2)}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Y: ${dbData[0].YA.toFixed(2)}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Z: ${dbData[0].ZA.toFixed(2)}, `}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>Gyroscope:{' '}
            <ThemedText style={styles.highlight}>{`X: ${dbData[0].XG.toFixed(2)}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Y: ${dbData[0].YG.toFixed(2)}, `}</ThemedText>
            <ThemedText style={styles.highlight}>{`Z: ${dbData[0].ZG.toFixed(2)}, `}</ThemedText>
          </ThemedText>
  
          <View style={styles.horizontalButtonContainer}>
            <TouchableOpacity style={[styles.defaultButton, styles.notLastButton, isRecording ? styles.activeStateButton : null]} onPress={() => setIsRecording(!isRecording)}>
              <ThemedText style={styles.defaultButtonText}>{isRecording ? "Stop Recording" : "Start Recording"}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.defaultButton]} onPress={() => resetDatabase()}>
              <ThemedText style={styles.defaultButtonText}>Rest Database</ThemedText>
            </TouchableOpacity>
          </View>
        </View>}
        </>
    );
  }
  
  const styles = StyleSheet.create({
    body: {
    },
    bleSection: {
    },
    sensorSection: {
    },
    sectionContainer: {
      flex: 1,
      marginTop: 12,
      marginBottom: 12,
      paddingHorizontal: 24,
    },
    masterTitle: {
      fontSize: 22,
      marginBottom: 5,
      fontWeight: '600',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '600',
      textAlign: 'center',
    },
    sectionDescription: {
      fontSize: 12,
      fontWeight: '400',
      textAlign: 'center',
    },
    horizontalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    defaultButton: {
      borderRadius: 5,
      backgroundColor: '#303030',
      alignSelf: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginVertical: 15,
    },
    defaultButtonText: {
      fontSize: 10,
      letterSpacing: 0,
      textAlign: 'center',
      color: '#ffffff',
    },
    defaultLinkContainer: {
      alignSelf: 'center',
      justifyContent: 'center',
    },
    defaultLink: {
      fontSize: 12,
      textDecorationLine: 'underline',
      color: '#505050',
    },
    listActionLink: {
      fontSize: 10,
      textDecorationLine: 'underline',
      color: '#50a050',
    },
    listActionLinkGreyed: {
      fontSize: 10,
      color: '#303030',
    },
    deviceInfoContainer: {
      flexDirection: 'row',
    },
    deviceInfo: {
      padding: 3,
      fontSize: 10,
      fontWeight: '400',
    },
    notLastButton: {
      marginRight: 15,
    },
    activeStateButton: {
      backgroundColor: '#808080',
    },
    highlight: {
      fontWeight: '700',
    },
  });