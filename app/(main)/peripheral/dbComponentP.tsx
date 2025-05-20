import { initDatabase, getLastRow, getRowCount, addSensorData } from '@/utils/sqlite_db_p';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';
import { useLogs } from '@/app/(main)/logContext';

const TAG = "P/dbComponent";

export default function DbComponentP({ dbState, sensorData }: { dbState: DbStateP, sensorData: SensorStateP["sensorData"] }) {
  const  [sensorDataCount, setSensorDataCount] = useState(0);
  const { addLog } = useLogs();

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
    if (sensorData) {
      addSensorData({...sensorData[0]});
      if (sensorDataCount % 10 === 0) {
        getDbStats();
      }
      setSensorDataCount(prev => (prev+1));
    }
  }, [sensorData]);

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