import { getLastRow, getPredictionStats } from '@/utils/sqlite_db_c';
import { View } from 'react-native';
import { useEffect } from 'react';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleCard from '../mini-components/simpleCard';
import DbListItem from '../mini-components/dbListItem';
import TextListItemSubCard from '../mini-components/textListItemSubCard';
import HistoryBarChart from '../mini-components/historyBarChart';
import { useLogs } from '@/utils/logContext';
import { BEHAVIOR_MAPPING } from '@/utils/constants';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';
import { lang } from '@/assets/languages/lang-provider';

const TAG = "C/historyComponent";

export default function HistoryComponentC({ historyState, dbStats }: { historyState: HistoryStateC, dbStats: DbStateC["dbStats"]}) {
  const [barChartData, setBarChartData] = useState([0, 0, 0, 0, 0, 0] as HistoryBardChartData["data"], "setBarChartData");
  const { addLog } = useLogs();

  const {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  } = historyState;
  
  const updateHistory = async () => {
    addLog(TAG, `Gettings stats...`);
    setLastRow(await getLastRow());
    setPredictionStats(await getPredictionStats());
  };

  useEffect(() => {
    updateHistory();
  }, [dbStats]);

  useEffect(() => {
    if (predictionStats && predictionStats.length !== 0) {
      addLog(TAG, `Got prediction stats with length: ${predictionStats.length} !`);
      let barChartData_ = [0, 0, 0, 0, 0, 0] as HistoryBardChartData["data"];
      BEHAVIOR_MAPPING.forEach((behavior, behaviorIndex) => {
        let foundIndex = -1;
        predictionStats.forEach((predictionStat, predictionIndex) => {
          if (predictionStat.predictedClass === behaviorIndex) {
            foundIndex = predictionIndex;
          }
        });
        if (foundIndex !== -1) {
          barChartData_[behaviorIndex] = predictionStats[foundIndex].count;
        } else {
          barChartData_[behaviorIndex] = 0;
        }
      });
      setBarChartData(barChartData_);
    }
  }, [predictionStats]);

  return (
    <>
      <SimpleCard title={lang["history"]}>
        {(lastRow && lastRow.length !== 0) ? (lastRow.map((entry, index) => (
          <DbListItem key={index} entryName={`${lang["cattle"]} ${entry.device_id}`}>
            <TextListItemSubCard itemKey={`${lang["created_at"]}:`} itemValue={new Date(entry.createdAt).toLocaleString()} />
            <TextListItemSubCard itemKey={`${lang["recorded"]}:`} itemValue={dbStats.row_count} />
          </DbListItem>
        ))) : <Tex>{lang["no_entries_to_show"]}</Tex>}
      </SimpleCard>

      <SimpleCard title={lang["behavior_stats"]}>
        <View style={styles.HISTORY_CHARTS}>
          <View style={styles.HISTORY_CHARTS_HEADER}>
            {/* <Tex style={styles.SUBCOMPONENT_TITLE}>Select TimeRange</Tex>
            <Tex>Last 1h</Tex> */}
          </View>
          <View style={styles.HISTORY_CHARTS_BODY}>
            {/* <SensorView /> */}
            <View style={styles.STATS_BAR_CHART}>
              <View style={styles.STATS_BAR_CHART_HEADER}>
                {/* <Tex style={styles.SUBCOMPONENT_TITLE}>Behvaior count</Tex> */}
              </View>
              <HistoryBarChart barChartData={{labels: BEHAVIOR_MAPPING as HistoryBardChartData["labels"], data: barChartData}} />
            </View>
          </View>
        </View>
      </SimpleCard>
    </>
  );
}
  