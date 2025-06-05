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
import { useLangs } from "@/utils/langContext";
import { BEHAVIOR_MAPPING } from '@/utils/constants';
import { useStateLogger as useState } from '@/utils/useStateLogger';
import CollapsibleButton from '../mini-components/collaplisbleButton';
import SimpleSubCard from '../mini-components/simpleSubcard';

const TAG = "C/historyComponent";

const getTimeRange = (key?: string): [number, number] => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (key === "since_the_past_24") {
    return [now - ONE_DAY, now];
  }
  else if (key === "since_last_week") {
    return [now - 7 * ONE_DAY, now];
  }
  else if (key === "since_last_month") {
    const date = new Date(now);
    date.setMonth(date.getMonth() - 1);
    return [date.getTime(), now];
  }
  else if (key === "this_year") {
    const date = new Date(now);
    date.setMonth(0);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return [date.getTime(), now];
  }
  else if (key === "since_always") {
    return [0, now];
  }
  
  return [now - ONE_DAY, now];
};


export default function HistoryComponentC({ historyState, dbStats }: { historyState: HistoryStateC, dbStats: DbStateC["dbStats"]}) {
  const [barChartData, setBarChartData] = useState([0, 0, 0, 0, 0, 0] as HistoryBardChartData["data"], "setBarChartData");
  const [deviceId, setDeviceId] = useState(null);
  const [timeRange, setTimeRange] = useState("since_the_past_24");
  const { addLog } = useLogs();
  const { lang } = useLangs();

  const {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  } = historyState;
  
  const updateHistory = async () => {
    addLog(TAG, `Gettings stats...`);
    setLastRow(await getLastRow());
    if (deviceId) {
      const [startTime, endTime] = getTimeRange(timeRange);
      console.log(new Date(startTime).toDateString());
      console.log(new Date(endTime).toDateString());
      const _predictionStats = await getPredictionStats(startTime, endTime);
      let found = false;
      _predictionStats.forEach(_predictionStat => {
        if (_predictionStat.device_id === deviceId) {
          setPredictionStats(_predictionStat.stats);
          found = true;
        }
      });
      if (!found) {
        setPredictionStats([]);
      }
    }
  };

  useEffect(() => {
    updateHistory();
  }, [dbStats, deviceId, timeRange]);

  useEffect(() => {
    if (predictionStats) {
      addLog(TAG, `Got prediction stats with length: ${predictionStats.length} !`);
      const barChartData_ = [0, 0, 0, 0, 0, 0] as HistoryBardChartData["data"];
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
          <DbListItem key={index} onPressE={() => {setDeviceId(entry.device_id)}} entryName={`${lang["cattle"]} ${entry.device_id}`}>
            <TextListItemSubCard itemKey={`${lang["created_at"]}:`} itemValue={new Date(entry.createdAt).toLocaleString()} />
            <TextListItemSubCard itemKey={`${lang["recorded"]}:`} itemValue={dbStats.row_count_specific && dbStats.row_count_specific[index]?.count} />
          </DbListItem>
        ))) : <Tex>{lang["no_entries_to_show"]}</Tex>}
      </SimpleCard>

      {deviceId && <SimpleCard title={lang["behavior_stats"]}>
        <View style={styles.HISTORY_CHARTS}>
          <View>
            <CollapsibleButton value={lang["change_time_interval"]} options={[
              lang["since_the_past_24"],
              lang["since_last_week"],
              lang["since_last_month"],
              lang["this_year"],
              lang["since_always"],
            ]} onPressE={[
              () => setTimeRange("since_the_past_24"),
              () => setTimeRange("since_last_week"),
              () => setTimeRange("since_last_month"),
              () => setTimeRange("this_year"),
              () => setTimeRange("since_always"),
            ]} />
          </View>
          <View style={styles.HISTORY_CHARTS_BODY}>
            {/* <SensorView /> */}
            <View style={styles.STATS_BAR_CHART}>
              <SimpleSubCard title={`${lang["predicted_behavior_count_by_cattle"]} (${lang[timeRange]})`}>
                <HistoryBarChart barChartData={{labels: BEHAVIOR_MAPPING as HistoryBardChartData["labels"], data: barChartData}} />  
              </SimpleSubCard>
            </View>
          </View>
        </View>
      </SimpleCard>}
    </>
  );
}
  