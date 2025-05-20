import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import themeI from '@/assets/themes';
import SimpleCard from '../mini-components/simpleCard';

const FREQUENCY = 100; // 100ms = 10Hz
const SEQUENCE_LENGTH = 10;

export default function SensorComponentC({ sensorState, settings }: {sensorState: SensorStateC, settings:SensorViewSettingsC}) {
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
      setXaData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), xa]);
      setYaData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), ya]);
      setZaData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), za]);
      setXgData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), xg]);
      setYgData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), yg]);
      setZgData(prev => [...prev.slice(-(SEQUENCE_LENGTH-1)), zg]);
    }
  }, [sensorState.sensorData]);

  return (
    <>
      <SimpleCard title={settings.show_title ? 'SensorInfo' : null}>
        <View style={[styles.MINI_SENSOR_CHART]}>
          <View style={styles.MINI_SENSOR_CHART_HEADER}>
            <Tex style={styles.SUBCOMPONENT_TITLE}>Accelerometer</Tex>
            {(settings.show_coord && sensorState.sensorData) && <Tex>
              x: {sensorState.sensorData[sensorState.sensorData.length-1]?.xa.toFixed(3)},
              y: {sensorState.sensorData[sensorState.sensorData.length-1]?.ya.toFixed(3)},
              z: {sensorState.sensorData[sensorState.sensorData.length-1]?.za.toFixed(3)}
            </Tex>}
          </View>
          <LineChart
            data={{
              labels: [],
              datasets: [
                { data: xaData, color: () => '#ff0000', strokeWidth: 1 },
                { data: yaData, color: () => '#00ff00', strokeWidth: 1 },
                { data: zaData, color: () => '#0000ff', strokeWidth: 1 },
              ],
            }}
            width={Dimensions.get("window").width-40}
            height={100}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: themeI.backgroundColors.component,
              backgroundGradientFrom: themeI.backgroundColors.component,
              backgroundGradientTo: themeI.backgroundColors.component,
              fillShadowGradient: themeI.backgroundColors.component,
              fillShadowGradientFrom: themeI.backgroundColors.component,
              fillShadowGradientTo: themeI.backgroundColors.component,
              color: (opacity = 1) => themeI.fontColors.default,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "1",
                strokeWidth: "1",
                stroke: "#000"
              },
              propsForBackgroundLines: {
                stroke: "transparent"
              },
              
            }}
            bezier
            style={{
              borderRadius: 5
            }}
          />
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
            <LineChart
              data={{
                labels: [],
                datasets: [
                  { data: xgData, color: () => '#ff0000', strokeWidth: 1 },
                  { data: ygData, color: () => '#00ff00', strokeWidth: 1 },
                  { data: zgData, color: () => '#0000ff', strokeWidth: 1 },
                ],
              }}
              width={Dimensions.get("window").width-40}
              height={100}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: themeI.backgroundColors.component,
                backgroundGradientFrom: themeI.backgroundColors.component,
                backgroundGradientTo: themeI.backgroundColors.component,
                fillShadowGradient: themeI.backgroundColors.component,
                fillShadowGradientFrom: themeI.backgroundColors.component,
                fillShadowGradientTo: themeI.backgroundColors.component,
                color: (opacity = 1) => themeI.fontColors.default,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "1",
                  strokeWidth: "1",
                  stroke: "#000"
                },
                propsForBackgroundLines: {
                  stroke: "transparent"
                },
              }}
              bezier
              style={{
                marginVertical: 0,
                borderRadius: 5
              }}
            />
        </View>
      </SimpleCard>
    </>
  );
}
  