import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { initDatabase, addSensorData, resetDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db';
import { useEffect, useState } from 'react';
import SensorView from './sensorView';

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
  last_row: DbEntry[],
  row_count: {device_id: number, count: number}[],
}

export default function HistoryView({ }) {
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
      setDbStats({
        last_read: Date.now(),
        last_row: lastRow,
        row_count: rowCount,
      });
    };
  };


  useEffect(() => {
    initDb();
  }, []);

  useEffect(() => {
    getDbStats();
  }, [dbData]);

  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.history]}>
        <Tex style={styles.COMPONENT_TITLE} >
          History
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          {dbStats?.last_row.map((entry, index) => (
            <View key={index} style={[styles.HISTORY_ITEM, styles.MD_ROW_GAP]}>
              <View style={styles.HISTORY_ITEM_HEADER}>
                <Tex style={styles.SUBCOMPONENT_TITLE}>{`Cattle ${entry.device_id}`}</Tex>
              </View>
              <View style={styles.HISTORY_ITEM_BODY}>
                <View>
                  <View style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>Created at:</Tex>
                      <Tex>{entry.DateTime}</Tex>
                  </View>
                  <View style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>Recorded:</Tex>
                      <Tex>{dbStats.row_count[entry.device_id-1].count}</Tex>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.COMPONENT_CARD, styles.history]}>
        <Tex style={styles.COMPONENT_TITLE}>
          History
        </Tex>
        <View style={styles.HISTORY_CHARTS}>
          <View style={styles.HISTORY_CHARTS_HEADER}>
            <Tex style={styles.SUBCOMPONENT_TITLE}>Select TimeRange</Tex>
            <Tex>Last 1h</Tex>
          </View>
          <View style={styles.HISTORY_CHARTS_BODY}>
            {/* <SensorView /> */}
            <View style={styles.STATS_BAR_CHART}>
              <View style={styles.STATS_BAR_CHART_HEADER}>
                <Tex style={styles.SUBCOMPONENT_TITLE}>Behvaior stats</Tex>
              </View>
              <View style={styles.STATS_BAR_CHART_BODY}>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
  