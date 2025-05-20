import { getLastRow, getPredictionStats } from '@/utils/sqlite_db_c';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import DbListItem from '../mini-components/dbListItem';
import TextListItemSubCard from '../mini-components/textListItemSubCard';
import HistoryBarChart from '../mini-components/historyBarChart';
import { useLogs } from '@/app/(main)/logContext';

const TAG = "C/historyComponent";

export default function HistoryComponentC({ historyState, dbStats }: { historyState: HistoryStateC, dbStats: DbStateC["dbStats"]}) {
  const { addLog } = useLogs();

  const {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  } = historyState;
  
  const init = async () => {
    addLog(TAG, `Gettings stats...`);
    setLastRow(await getLastRow());
    setPredictionStats(await getPredictionStats());
  };

  useEffect(() => {
    init();
  }), [];

  console.log(predictionStats);
  return (
    <>
      <SimpleCard title='History'>
        {lastRow?.map((entry, index) => (
          <DbListItem key={index} entryName={`Cattle ${entry.device_id}`}>
            <TextListItemSubCard itemKey='Created at:' itemValue={new Date(entry.createdAt).toLocaleString()} />
            <TextListItemSubCard itemKey='Recorded:' itemValue={dbStats.row_count} />
          </DbListItem>
        ))}
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
  