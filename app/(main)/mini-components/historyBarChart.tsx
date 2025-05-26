import { Dimensions, View } from 'react-native';
import themeI from '@/assets/themes';
import { BarChart } from "react-native-gifted-charts";
import SimpleSubCard from './simpleSubcard';
import Tex from '../base-components/tex';
import { useLangs } from "@/utils/langContext";


export default function HistoryBarChart({ barChartData }: { barChartData: HistoryBardChartData}) {
  const { labels, data } = barChartData;
  const { lang } = useLangs();

  const formattedData = labels.map((label, index) => ({
    label: lang[label],
    value: data[index],
    topLabelComponent: () => (
      <Tex>{data[index]}</Tex>
    )
  }));

  return(
    <SimpleSubCard title='Nombre total de comportements enregistés'>
        <BarChart
          data={formattedData}
          frontColor="#fff"
          hideRules
          adjustToWidth
          maxValue={Math.max(...data) + 1}
          xAxisLabelTextStyle={{ color: "#fff", fontSize: 10 }}   
          xAxisColor={"#fff"}
          xAxisThickness={0}
          yAxisLabelWidth={0}
          yAxisColor={undefined}
          yAxisThickness={0}
          barBorderRadius={4}
          barWidth={41}
          initialSpacing={0}
          spacing={22}
          endSpacing={0}
        />
    </SimpleSubCard>
  )
}