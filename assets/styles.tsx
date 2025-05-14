import { StyleSheet } from 'react-native';
import themeI from "./themes";

const styles = StyleSheet.create({
  MAIN: {
    padding: themeI.padding.md,
  },
  COMPONENT_CARD: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: themeI.backgroundColors.light,
    borderRadius: themeI.borderRadius.md,
    padding: themeI.padding.md,
    marginBottom: themeI.spacing.lg,
  },
  COMPONENT_WRAPPER: {
    flexDirection: 'column',
  },
  COMPONENT_TITLE: {
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: themeI.spacing.lg,
  },
  COMPONENT_LIST_ITEM: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  SUBCOMPONENT_CARD: {
    paddingLeft: themeI.padding.sm,
  },
  SUBCOMPONENT_TITLE: {
    marginBottom: themeI.spacing.md,
    fontWeight: 'bold',
  },
  SUBCOMPONENT_LIST_ITEM: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  MINI_SENSOR_CHART: {
  },
  MINI_SENSOR_CHART_HEADER: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  MINI_SENSOR_CHART_BODY: {
    width: '100%',
    minHeight: 50,
    backgroundColor: themeI.backgroundColors.preview,
    borderRadius: themeI.borderRadius.md,
  },

  CLASS_PROBABILITY: {

  },
  CLASS_PROBABILITY_HEADER: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CLASS_PROBABILITY_BODY: {
    width: '100%',
    minHeight: 5,
    backgroundColor: themeI.backgroundColors.preview,
    borderRadius: themeI.borderRadius.md,
  },

  HISTORY_ITEM: {
    borderWidth: 1,
    borderColor: themeI.borderColors.default,
    borderRadius: themeI.borderRadius.md,
    padding: themeI.padding.sm,
  },
  HISTORY_ITEM_HEADER: {

  },
  HISTORY_ITEM_BODY: {

  },

  HISTORY_CHARTS: {

  },
  HISTORY_CHARTS_HEADER: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  HISTORY_CHARTS_BODY: {

  },
  STATS_BAR_CHART: {

  },
  STATS_BAR_CHART_HEADER: {

  },
  STATS_BAR_CHART_BODY: {
    width: '100%',
    minHeight: 50,
    backgroundColor: themeI.backgroundColors.preview,
    borderRadius: themeI.borderRadius.md,
  },

  ble_info: {

  },
  sensor_info: {

  },
  db_info: {

  },
  model_info: {

  },
  history: {

  },

  MD_ROW_GAP: {
    marginBottom: themeI.spacing.md,
  }
});
export default styles;
