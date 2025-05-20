import { initDatabase, resetDatabase, getLastRow, getRowCount, addSensorData } from '@/utils/sqlite_db_p';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';

const TAG = "C/dbComponent";

export default function DbComponentP({ dbState, sensorData }: { dbState: DbStateP, sensorData: SensorStateP["sensorData"] }) {
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

  useEffect(() => {
    updateDb();
  }, [sensorData]);

  const updateDb = () => {
    if (sensorData) {
      addSensorData({...sensorData[0]});
    }
  }

  const initDb = async () => {
    setIsDbConnected(await initDatabase());
  };
  const getDbStats = async () => {
    const lastRow = await getLastRow();
    const rowCount = await getRowCount();
    setDbStats({
      last_read: Date.now(),
      last_row: lastRow,
      row_count: rowCount,
    });
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