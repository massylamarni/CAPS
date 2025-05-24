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
import { lang } from '@/assets/languages/lang-provider';

const TAG = "P/historyComponent";

export default function HistoryComponentP({ historyState, dbStats }: { historyState: HistoryStateP, dbStats: DbStateP["dbStats"]}) {
  const { addLog } = useLogs();
  
  const {
    lastRow,
    setLastRow,
  } = historyState;
  
  const updateHistory = async () => {
    setLastRow(await getLastRow());
  };

  useEffect(() => {
    updateHistory();
  }, [dbStats]);

  return (
    <>
      <SimpleCard title={lang["history"]}>
        <DbListItem entryName={`${lang["cattle"]} X`}>
          <TextListItemSubCard itemKey={`${lang["created_at"]}:`} itemValue={new Date(lastRow?.createdAt).toLocaleString()} />
          <TextListItemSubCard itemKey={`${lang["recorded"]}:`} itemValue={dbStats.row_count} />
        </DbListItem>
      </SimpleCard>
    </>
  );
}
  