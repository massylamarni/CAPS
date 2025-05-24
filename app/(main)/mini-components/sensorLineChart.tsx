import { View } from 'react-native';
import themeI from '@/assets/themes';
import { LineChart } from 'react-native-gifted-charts';


export default function SensorLineChart({ xyzData }: { xyzData: SensorLineChartData}) {
  const { xData, yData, zData } = xyzData;
  const formatData = (data: number[], color: string) =>
    data.map((value, index) => ({
      value,
    }));
  

  return(
      <LineChart
        data={formatData(xData, "#ff0000")}
        data2={formatData(yData, "00ff00")}
        data3={formatData(zData, "0000ff")}
        color1='#ff0000'
        color2='#00ff00'
        color3='#0000ff'
        hideRules
        adjustToWidth
        xAxisLabelsHeight={0}
        xAxisColor={undefined}
        xAxisThickness={0}
        yAxisColor={"#fff"}
        yAxisThickness={1}
        yAxisTextStyle={{ color: "#fff", fontSize: 5 }}
        hideYAxisText={false}
        disableScroll={true}
        curved={true}
        hideDataPoints
        thickness={1}
        initialSpacing={0}
        endSpacing={0}
        stepValue={0.25}
        noOfSections={5}
        noOfSectionsBelowXAxis={2}
        stepHeight={10}
      />
  )
}