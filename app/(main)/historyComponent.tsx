import { getLastRow, getPredictionStats, DbEntry } from '@/utils/sqlite_db';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import Tex from './base-components/tex';
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
import { DbState, HistoryState } from '.';

const TAG = "C/historyComponent";

export default function HistoryComponent({ historyState, dbStats }: { historyState: HistoryState, dbStats: DbState["dbStats"]}) {
  const {
    lastRow,
    setLastRow,
    predictionStats,
    setPredictionStats,
  } = historyState;
  
  const init = async () => {
    setLastRow(await getLastRow());
    setPredictionStats(await getPredictionStats());
  };

  useEffect(() => {
    init();
  }), [];

  console.log(predictionStats);
  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.history]}>
        <Tex style={styles.COMPONENT_TITLE} >
          History
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          {lastRow?.map((entry, index) => (
            <View key={index} style={[styles.HISTORY_ITEM, styles.MD_ROW_GAP]}>
              <View style={styles.HISTORY_ITEM_HEADER}>
                <Tex style={styles.SUBCOMPONENT_TITLE}>{`Cattle ${entry.device_id}`}</Tex>
              </View>
              <View style={styles.HISTORY_ITEM_BODY}>
                <View>
                  <View style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>Created at:</Tex>
                      <Tex>{entry.DateTime}</Tex>
                  </View>
                  <View style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>Recorded:</Tex>
                      <Tex>{dbStats.row_count}</Tex>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.COMPONENT_CARD, styles.history]}>
        <Tex style={styles.COMPONENT_TITLE}>
          History
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
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
        </View>
      </View>
    </>
  );
}
  