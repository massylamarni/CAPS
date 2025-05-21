import { Dimensions } from 'react-native';
import themeI from '@/assets/themes';
import {
  BarChart,
} from "react-native-chart-kit";

export default function HistoryBarChart({ barChartData }: { barChartData: HistoryBardChartData}) {
  const { labels, data } = barChartData;

  return(
    <BarChart
      data={
        {labels: labels,
        datasets: [
          {
            data: data
          }
        ]}
      }
      yAxisLabel=""
      yAxisSuffix=""
      xLabelsOffset={0}
      yLabelsOffset={0}
      width={Dimensions.get("window").width-40}
      height={200}
      showValuesOnTopOfBars={true}
      withHorizontalLabels={false}
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
      verticalLabelRotation={0}
    />
  )
}