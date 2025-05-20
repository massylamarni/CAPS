import { initDatabase, resetDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db_c';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';

const TAG = "C/dbComponent";

export default function DbComponentC({ dbState }: { dbState: DbStateC }) {
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
        current.createdAt > latest.createdAt ? current : latest
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
      <SimpleCard title='Database Info'>
        <View>
          <TextListItem itemKey='Status' itemValue={isDbConnected ? 'Connected' : 'Disconnected'} />
          <TextListItem itemKey='Last read' itemValue={new Date(dbStats?.last_read).toLocaleString()} />
          <TextListItem itemKey='Last write' itemValue={new Date(dbStats?.last_row?.createdAt ?? 0).toLocaleString()} />
          <TextListItem itemKey='Row count' itemValue={dbStats?.row_count} />
        </View>
      </SimpleCard>
    </>
  );
}