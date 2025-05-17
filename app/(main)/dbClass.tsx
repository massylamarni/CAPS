import React from 'react';
import { initDatabase, addSensorData, resetDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db';
import { SensorState } from './sensorClass';
import { BlueState } from './blueClass';

type DbEntry = {
  id: number;
  DateTime: number;
  XA: number;
  YA: number;
  ZA: number;
  XG: number;
  YG: number;
  ZG: number;
  device_id: number;
}

export interface DbState {
  isDbConnected: boolean,
  dbData: DbEntry[],
  dbStats: {
      last_read: number,
      last_row: DbEntry | null,
      row_count: number,
  }
}

export interface DbProps {
  dbBridge: {
    setDbState: (DbState: any) => void,
    sensorState: SensorState | null,
    blueState: BlueState | null,
  },
}

class DbComponent extends React.Component<DbProps, DbState> {
  // static defaultProps: Partial<DbProps> = { }

  state: DbState = {
    isDbConnected: false,
    dbData: [],
    dbStats: {
        last_read: 0,
        last_row: null,
        row_count: 0,
    }
  };

  async componentDidMount () {
    this.initDb();
    this.getDbStats();
  }

  componentWillUnmount() {
    
  }

  componentDidUpdate(prevProps: Readonly<DbProps>, prevState: Readonly<DbState>, snapshot?: any): void {
    this.dbGetter();
    if (prevProps.dbBridge.sensorState != this.props.dbBridge.sensorState) { //sensorState
      this.updateDb();
    }
    if (prevState.dbData != this.state.dbData) {
      this.getDbStats();
    }
  }

  initDb = async () => {
    this.setState({ isDbConnected: await initDatabase() });
  };

  getDbStats = async () => {
    const lastRow = await getLastRow();
    if (lastRow.length !== 0) {
      const rowCount = await getRowCount();
      const most_recent_row = lastRow.reduce((latest, current) =>
        current.DateTime > latest.DateTime ? current : latest
      );
      let row_count_sum = 0;
      rowCount.forEach(entry => {
        row_count_sum += entry.count;
      })
      this.setState({ dbStats: {
        last_read: Date.now(),
        last_row: most_recent_row,
        row_count: row_count_sum,
      }});
    };
  };

  updateDb = () => {
    if (this.props.dbBridge.sensorState?.sensorData) {
      const simulate_mac = "MAC";
      if (simulate_mac) addSensorData({...this.props.dbBridge.sensorState.sensorData[0], mac: simulate_mac});
    }
  }

  dbGetter = () => {
    this.props.dbBridge.setDbState(this.state);
  }


  render() {
    return(
      <>
        
      </>
    )
  }
}

export default DbComponent;