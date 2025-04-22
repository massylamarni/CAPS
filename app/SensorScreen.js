import { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
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
/*
  // Initialize DB
  useEffect(() => {
    resetDatabase();
    setInterval(async () => {
      const tempDbData = await getAllData();
      tempDbData.length !== 0 ? setDbData(tempDbData) : console.log("DB isEmpty");;
    }, 3000);
  }, []);
*/
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
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.masterTitle}>Sensor Screen</Text>
        <Text style={styles.sectionDescription}>Accelerometer:{' '}
          <Text style={styles.highlight}>{`X: ${sensorData[sensorData.length-1].xa.toFixed(2) ?? "N/A"}, `}</Text>
          <Text style={styles.highlight}>{`Y: ${sensorData[sensorData.length-1].ya.toFixed(2) ?? "N/A"}, `}</Text>
          <Text style={styles.highlight}>{`Z: ${sensorData[sensorData.length-1].za.toFixed(2) ?? "N/A"}`}</Text>
        </Text>

        <Text style={styles.sectionDescription}>Gyroscope:{' '}
          <Text style={styles.highlight}>{`X: ${sensorData[sensorData.length-1].xg.toFixed(2) ?? "N/A"}, `}</Text>
          <Text style={styles.highlight}>{`Y: ${sensorData[sensorData.length-1].yg.toFixed(2) ?? "N/A"}, `}</Text>
          <Text style={styles.highlight}>{`Z: ${sensorData[sensorData.length-1].zg.toFixed(2) ?? "N/A"}`}</Text>
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>DataBase</Text>
        </View>
        <Text style={styles.sectionDescription}>id:{' '}
          <Text style={styles.highlight}>{dbData[0].id}</Text>
        </Text>
        <Text style={styles.sectionDescription}>DateTime:{' '}
          <Text style={styles.highlight}>{dbData[0].DateTime}</Text>
        </Text>
        <Text style={styles.sectionDescription}>Accelerometer:{' '}
          <Text style={styles.highlight}>{`X: ${dbData[0].XA.toFixed(2)}, `}</Text>
          <Text style={styles.highlight}>{`Y: ${dbData[0].YA.toFixed(2)}, `}</Text>
          <Text style={styles.highlight}>{`Z: ${dbData[0].ZA.toFixed(2)}, `}</Text>
        </Text>
        <Text style={styles.sectionDescription}>Gyroscope:{' '}
          <Text style={styles.highlight}>{`X: ${dbData[0].XG.toFixed(2)}, `}</Text>
          <Text style={styles.highlight}>{`Y: ${dbData[0].YG.toFixed(2)}, `}</Text>
          <Text style={styles.highlight}>{`Z: ${dbData[0].ZG.toFixed(2)}, `}</Text>
        </Text>

        <View style={styles.horizontalButtonContainer}>
          <TouchableOpacity style={[styles.defaultButton, styles.notLastButton, isRecording ? styles.activeStateButton : null]} onPress={() => setIsRecording(!isRecording)}>
            <Text style={styles.defaultButtonText}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.defaultButton]} onPress={() => resetDatabase()}>
            <Text style={styles.defaultButtonText}>Rest Database</Text>
          </TouchableOpacity>
        </View>
      </View>
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