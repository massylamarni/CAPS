import { initDatabase, resetDatabase, getLastRow, getRowCount, DbEntry } from '@/utils/sqlite_db';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { DbState } from '.';

const TAG = "C/dbComponent";

export default function DbComponent({ dbState }: { dbState: DbState }) {
  const {
    isDbConnected,
    setIsDbConnected,
    dbStats,
    setDbStats,
  } = dbState;
  
  useEffect(() => {
    initDb();
    getDbStats();
  }, []);

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
              <Tex>{new Date(dbStats?.last_read).toLocaleString()}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Last write</Tex>
              <Tex>{new Date(dbStats?.last_row?.DateTime ?? 0).toLocaleString()}</Tex>
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