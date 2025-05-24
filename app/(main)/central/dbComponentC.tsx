import { initDatabase, getLastRow, getRowCount } from '@/utils/sqlite_db_c';
import { useEffect } from 'react';
import { View } from 'react-native';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';
import { useLogs } from '@/utils/logContext';
import { lang } from '@/assets/languages/lang-provider';

const TAG = "C/dbComponent";

export default function DbComponentC({ dbState, predictions }: { dbState: DbStateC, predictions: ModelStateC["predictions"] }) {
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
  }, [predictions]);

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
      <SimpleCard title={lang["database_info"]}>
        <View>
          <TextListItem itemKey={lang["status"]} itemValue={isDbConnected ? lang["connected"] : lang["disconnected"]} />
          <TextListItem itemKey={lang["last_read"]} itemValue={new Date(dbStats?.last_read).toLocaleString()} />
          <TextListItem itemKey={lang["last_write"]} itemValue={new Date(dbStats?.last_row?.createdAt ?? 0).toLocaleString()} />
          <TextListItem itemKey={lang["row_count"]} itemValue={dbStats?.row_count} />
        </View>
      </SimpleCard>
    </>
  );
}