import { initDatabase, getLastRow, getRowCount, addSensorData } from '@/utils/sqlite_db_p';
import { useEffect } from 'react';
import { View } from 'react-native';
import SimpleCard from '../mini-components/simpleCard';
import TextListItem from '../mini-components/textListItem';
import { useLogs } from '@/utils/logContext';
import { useLangs } from "@/utils/langContext";
import { useStateLogger as useState } from '@/utils/useStateLogger';

const TAG = "P/dbComponent";

export default function DbComponentP({ dbState, sensorData }: { dbState: DbStateP, sensorData: SensorStateP["sensorData"] }) {
  const  [sensorDataCount, setSensorDataCount] = useState(0, "setSensorDataCount");
  const { addLog } = useLogs();
  const { lang } = useLangs();

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
      addSensorData({...sensorData});
      if (sensorDataCount % 10 === 0) {
        getDbStats();
      }
      setSensorDataCount((prev: any) => (prev+1));
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