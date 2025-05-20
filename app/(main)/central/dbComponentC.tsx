import { initDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db_c';
import { useEffect } from 'react';
import { View } from 'react-native';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';
import { useLogs } from '@/app/(main)/logContext';

const TAG = "C/dbComponent";

export default function DbComponentC({ dbState, isPredicting }: { dbState: DbStateC, isPredicting: ModelStateC["isPredicting"] }) {
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
    getDbStats();
  }, [isPredicting]);

  const initDb = async () => {
    setIsDbConnected(await initDatabase());
  };
  const getDbStats = async () => {
    addLog(TAG, `Getting database stats...`);
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