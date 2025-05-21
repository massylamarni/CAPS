import { StyleSheet } from 'react-native';
import themeI from "./themes";

const styles = StyleSheet.create({
  MAIN: {
    height: "100%",
    backgroundColor: themeI.backgroundColors.back,
  },
  VIEW: {
    padding: themeI.padding.md,
  },

  /* Components */
  COMPONENT_CARD: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: themeI.backgroundColors.component,
    borderRadius: themeI.borderRadius.md,
    marginBottom: themeI.spacing.lg,
    overflow: 'hidden',
  },
  COMPONENT_WRAPPER: {
    flexDirection: 'column',
    padding: themeI.padding.md,
  },
  COMPONENT_TITLE: {
    backgroundColor: themeI.backgroundColors.componentTitle,
    fontSize: 13,
    fontWeight: 'bold',
    padding: themeI.padding.md,
  },
  COMPONENT_LIST_ITEM: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  /* SubComponents */
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

  /* Sensor chart */
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

  /* Probability view */
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

  /* History view */
  HISTORY_ITEM: {
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

  /* Unused */
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
  /* Generic */
  LEGEND_CONTAINER: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  MD_ROW_GAP: {
    marginBottom: themeI.spacing.md,
  },
  MD_COL_GAP: {
    marginRight: themeI.spacing.md,
  },
  HIDDEN: {
    display: "none",
  },
  HORIZONTAL_SEPARATOR: {
    borderBottomColor: '#ffffff10',
    borderBottomWidth: 1,
  },

  /* Scroll container */
  scrollContent: {
    paddingBottom: 50,
  },

  /* Navbar */
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: themeI.backgroundColors.navbar,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: themeI.borderRadius.md,
  },
  navButton: {
    height: '100%',
    width: '33%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Settings */
  buttonListItem: {
    height: 35,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
export default styles;
