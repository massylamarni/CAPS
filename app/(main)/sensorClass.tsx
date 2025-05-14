import React from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

type sensor_data_t = {
  x: number;
  y: number;
  z: number;
}

type dual_sensor_data_t = {
    xa: number;
    ya: number;
    za: number;
    xg: number;
    yg: number;
    zg: number;
}

const dual_sensor_data_d = { xa: 0, ya: 0, za: 0, xg: 0, yg: 0, zg: 0 };

export interface SensorState {
    sensorData: dual_sensor_data_t[],
}

export interface SensorProps {
  sensorBridge: {
    setSensorState: (SensorState: any) => void,
  }
}

class SensorComponent extends React.Component<SensorProps, SensorState> {
  // static defaultProps: Partial<SensorProps> = { }

  state: SensorState = {
    sensorData: [{...dual_sensor_data_d}],
  };

  accelSubscription: any;
  gyroSubscription: any;
  sensorDataInterval: any;

  async componentDidMount () {
    this.initSensors();
    this.sensorGetter();
  }

  componentWillUnmount() {
    this.accelSubscription?.remove();
    this.gyroSubscription?.remove();
    clearInterval(this.sensorDataInterval);
  }

  componentDidUpdate(prevProps: Readonly<SensorProps>, prevState: Readonly<SensorState>, snapshot?: any): void {
      this.sensorGetter();
  }

  initSensors() {
    Accelerometer.setUpdateInterval(100); // 100ms = 10Hz
    Gyroscope.setUpdateInterval(100);
    let accelData = {x: 0, y: 0, z: 0};
    let gyroData = {x: 0, y: 0, z: 0};
    this.accelSubscription = Accelerometer.addListener((data: sensor_data_t) => {
        accelData = data;
    });
    this.gyroSubscription = Gyroscope.addListener((data: sensor_data_t) => {
        gyroData = data;
    });
    this.sensorDataInterval = setInterval(() => {
      const groupedData = {
          xa: accelData.x,
          ya: accelData.y,
          za: accelData.z,
          xg: gyroData.x,
          yg: gyroData.y,
          zg: gyroData.z
      };

      this.setState((prev) => ({
        sensorData: [groupedData],
      }));
    }, 100);
  }

  sensorGetter() {
    this.props.sensorBridge.setSensorState(this.state);
  }


  render() {
    return(
      <>
        
      </>
    )
  }
}

export default SensorComponent;