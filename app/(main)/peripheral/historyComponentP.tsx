import { getLastRow } from '@/utils/sqlite_db_p';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import SimpleCard from '../mini-components/simpleCard';
import DbListItem from '../mini-components/dbListItem';
import TextListItemSubCard from '../mini-components/textListItemSubCard';

const TAG = "C/historyComponent";

export default function HistoryComponentP({ historyState, dbStats }: { historyState: HistoryStateP, dbStats: DbStateP["dbStats"]}) {
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
  }), [];

  console.log(predictionStats);
  return (
    <>
      <SimpleCard title='History'>
        <DbListItem entryName={`Cattle X`}>
          <TextListItemSubCard itemKey='Created at:' itemValue={lastRow?.createdAt} />
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
              <BarChart
                data={
                  {labels: ['0', '1', '2', '3', '7', '8'],
                  datasets: [
                    {
                      data: [20, 45, 28, 80, 99, 43]
                    }
                  ]}
                }
                yAxisLabel=""
                yAxisSuffix=""
                width={Dimensions.get("window").width-40}
                height={200}
                showValuesOnTopOfBars={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                chartConfig={{
                  backgroundColor: themeI.backgroundColors.component,
                  backgroundGradientFrom: themeI.backgroundColors.component,
                  backgroundGradientTo: themeI.backgroundColors.component,
                  fillShadowGradient: themeI.fontColors.default,
                  fillShadowGradientFrom: themeI.fontColors.default,
                  fillShadowGradientTo: themeI.fontColors.default,
                  fillShadowGradientOpacity: 1,
                  fillShadowGradientFromOpacity: 1,
                  fillShadowGradientToOpacity: 1,
                  color: (opacity = 1) => themeI.fontColors.default,
                  style: {
                    borderRadius: 5,
                  },
                  propsForBackgroundLines: {
                    stroke: "transparent"
                  },
                }}
                verticalLabelRotation={30}
              />
            </View>
          </View>
        </View>
      </SimpleCard>
    </>
  );
}
  