import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { initDatabase, addSensorData, resetDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db';
import { useEffect, useState } from 'react';
import { SensorState } from './sensorClass';

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

type DbStats = {
  last_read: number,
  last_row: DbEntry,
  row_count: number,
}

export default function DbView({ sensorState: sensorState, mac: mac }: {sensorState: SensorState, mac: string | undefined}) {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbData, setDbData] = useState([] as DbEntry[]);
  const [dbStats, setDbStats] = useState(null as DbStats | null);

  const initDb = async () => {
    setIsDbConnected(await initDatabase());
  };
  
  
  const getDbStats = async () => {
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
      setDbStats({
        last_read: Date.now(),
        last_row: most_recent_row,
        row_count: row_count_sum,
      });
    };
  };

  const updateDb = () => {
    if (sensorState.sensorData) {
      const simulate_mac = "MAC";
      if (simulate_mac) addSensorData({...sensorState.sensorData[0], mac: simulate_mac});
    }
  }

  useEffect(() => {
    initDb();
  }, []);
  
  useEffect(() => {
    updateDb();
  }, [sensorState.sensorData]);

  useEffect(() => {
    getDbStats();
  }, [dbData]);

  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.db_info]}>
        <Tex style={styles.COMPONENT_TITLE}>
          Database Info
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          <View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Status</Tex>
              <Tex>{isDbConnected ? 'Connected' : 'Disconnected'}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Last read</Tex>
              <Tex>{dbStats?.last_read}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Last write</Tex>
              <Tex>{dbStats?.last_row.DateTime}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Row count</Tex>
              <Tex>{dbStats?.row_count}</Tex>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
  