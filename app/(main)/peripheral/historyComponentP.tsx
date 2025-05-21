import { getLastRow } from '@/utils/sqlite_db_p';
import { View } from 'react-native';
import { useEffect } from 'react';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import DbListItem from '../mini-components/dbListItem';
import TextListItemSubCard from '../mini-components/textListItemSubCard';
import HistoryBarChart from '../mini-components/historyBarChart';
import { useLogs } from '@/utils/logContext';

const TAG = "P/historyComponent";

export default function HistoryComponentP({ historyState, dbStats }: { historyState: HistoryStateP, dbStats: DbStateP["dbStats"]}) {
  const { addLog } = useLogs();
  
  const {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  } = historyState;
  
  const init = async () => {
    setLastRow(await getLastRow());
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <SimpleCard title='History'>
        <DbListItem entryName={`Cattle X`}>
          <TextListItemSubCard itemKey='Created at:' itemValue={new Date(lastRow?.createdAt).toLocaleString()} />
          <TextListItemSubCard itemKey='Recorded:' itemValue={dbStats.row_count} />
        </DbListItem>
      </SimpleCard>
    </>
  );
}
  