import { getLastRow } from '@/utils/sqlite_db_p';
import { View } from 'react-native';
import { useEffect } from 'react';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import DbListItem from '../mini-components/dbListItem';
import TextListItemSubCard from '../mini-components/textListItemSubCard';
import HistoryBarChart from '../mini-components/historyBarChart';
import { useLogs } from '@/app/(main)/logContext';

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

      <SimpleCard title='History'>
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
              <HistoryBarChart barChartData={{labels: ['0', '1', '2', '3', '7', '8'], data: [20, 45, 28, 80, 99, 43]}} />
            </View>
          </View>
        </View>
      </SimpleCard>
    </>
  );
}
  