import { Dimensions } from 'react-native';
import themeI from '@/assets/themes';
import {
  LineChart,
} from "react-native-chart-kit";

export default function SensorLineChart({ xyzData }: { xyzData: SensorLineChartData}) {
  const { xData, yData, zData } = xyzData;

  return(
    <LineChart
      data={{
        labels: [],
        datasets: [
          { data: xData, color: () => '#ff0000', strokeWidth: 1 },
          { data: yData, color: () => '#00ff00', strokeWidth: 1 },
          { data: zData, color: () => '#0000ff', strokeWidth: 1 },
        ],
      }}
      width={Dimensions.get("window").width-40}
      height={100}
      yAxisLabel=""
      yAxisSuffix=""
      chartConfig={{
        backgroundColor: themeI.backgroundColors.component,
        backgroundGradientFrom: themeI.backgroundColors.component,
        backgroundGradientTo: themeI.backgroundColors.component,
        fillShadowGradient: themeI.backgroundColors.component,
        fillShadowGradientFrom: themeI.backgroundColors.component,
        fillShadowGradientTo: themeI.backgroundColors.component,
        color: (opacity = 1) => themeI.fontColors.default,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: "0",
          strokeWidth: "0",
          stroke: "#fff"
        },
        propsForBackgroundLines: {
          stroke: "transparent"
        },
        
      }}
      bezier
      style={{
        borderRadius: 5
      }}
    />
  )
}